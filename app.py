#!/usr/bin/env python3

import os
import random
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session, abort, g
from mysql import connector
from profanity_check import predict

app = Flask(__name__)
app.secret_key = os.environ['SECRET_KEY']

DB_CONF = {
    'database': 'visnake',
    'username': os.environ.get('DB_USER', 'visnake-admin'),
    'pwd': os.environ['DB_PASSWORD'],
    'host': os.environ['DB_HOST']
}
SCORE_LIMIT = 256

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new-game')
def new_game():
    if 'now_score' in session:
        session.pop('now_score')
    session['now_score'] = 0
    session['apples'] = []
    session['active_game'] = True
    session.modified = True
    return jsonify({'now_score': 0}), 200

@app.route('/add-apple')
def add_apple():
    try:
        if not session['active_game']:
            return abort(400, 'Game hasn\'t started yet...')
        apples = session.get('apples')
        apples.append(request.args['at'])
        session['apples'] = apples
        if len(session['apples']) > 2:
            return abort(400, 'Too many apples on the board')
        return '', 200
    except KeyError:
        return abort(400)

@app.route('/eat-apple')
def eat_apple():
    try:
        apples = session['apples']
        now_score = session['now_score']
        apples.pop(apples.index(request.args['at']))
        now_score += 1
        session['apples'] = apples
        session['now_score'] = now_score
        session.modified = True
        if session.get('now_score', 0) > SCORE_LIMIT:
            session['now_score'] = 0
            session.modified = True
            return abort(400, 'Score too high')
        return jsonify({'now_score': session.get('now_score')}), 200
    except (KeyError, ValueError):
        return abort(400)

@app.route('/game-over')
def game_over():
    session['active_game'] = False
    if session['now_score'] > session['max_score']:
        session['max_score'] = session['now_score']
    session.modified = True
    return jsonify({'is_highscore': is_highscore()})

@app.route('/highscores')
def highscores():
    return render_template(
        'highscores.html', top_monthly=top_ten_monthly(), top_all=top_ten_alltime())

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/score')
def score():
    max_score = session.get('max_score', 0)
    now_score = session.get('now_score', 0)
    return jsonify(
        {'max_score': max_score,
         'now_score': now_score}), 200

@app.route('/add-to-highscore')
def add_to_highscore():
    if not 'usr' in request.args:
        return abort(400)
    if len(request.args['usr']) > 50:
        return abort(400, 'Username too long')
    if not is_highscore():
        return abort(400, 'Score is not a highscore')
    if predict([request.args['usr']])[0] == 1:
        return abort(400, 'Username is too offensive')
    conn = connect_db()
    try:
        cur = conn.cursor()
        cur.execute(
            'insert into highscore values (%s, %s, %s)',
            (
                request.args['usr'],
                session['now_score'],
                datetime.strftime(datetime.now(), '%Y-%m-%d')
            )
        )
        conn.commit()
        cleanup_database_if_needed()
        return '', 201
    except connector.Error as err:
        if err.errno == 1062:
            print('Not adding duplicate entry to database')
            return '', 200
        print(f'SQL Error in /add-to-highscore: {err}')
        return abort(500)
    except KeyError as err:
        print(f'Key Error in /add-to-highscore: {err}')
        return abort(400)

@app.route('/top-month')
def top_monthly_json():
    return jsonify(top_ten_monthly())

@app.route('/top-all')
def top_all_json():
    return jsonify(top_ten_alltime())

@app.teardown_appcontext
def close_db(error):
    """ Closes the database at the end of the request """
    db = g.pop('db', None)
    if db is not None:
        db.close()

def is_highscore() -> bool:
    conn = connect_db()
    cur = conn.cursor()
    try:
        cur.execute('select count(*) from top_ten_all')
        if cur.fetchall()[0][0] < 10:
            return True
        cur.execute('select count(*) from top_ten_month')
        if cur.fetchall()[0][0] < 10:
            return True
        cur.execute('select min(score) from top_ten_month')
        if cur.fetchall()[0][0] < session['now_score']:
            return True
        return False
    finally:
        cur.close()

def top_ten_monthly() -> list:
    conn = connect_db()
    cur = conn.cursor(dictionary=True)
    cur.execute('select * from top_ten_month')
    monthly = cur.fetchall()
    cur.close()
    return monthly

def top_ten_alltime() -> list:
    conn = connect_db()
    cur = conn.cursor(dictionary=True)
    cur.execute('select * from top_ten_all')
    allscores = cur.fetchall()
    cur.close()
    return allscores

def cleanup_database_if_needed():
    if random.randint(1, 5) != 5:
        # dont need to check this every time
        return
    conn = connect_db()
    cur = conn.cursor()
    try:
        cur.execute('select count(*) from highscore')
        if cur.fetchone()[0] > 60:
            cur.callproc('cleanup_highscores')
            conn.commit()
    finally:
        cur.close()

def connect_db():
    if 'db' not in g:
        g.db = connector.connect(
            user=DB_CONF['username'],
            password=DB_CONF['pwd'],
            host=DB_CONF['host'],
            database=DB_CONF['database']
        )
    return g.db


if __name__ == '__main__':
    app.run()
