#!/usr/bin/env python3

import os
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session, abort, g
from mysql import connector

app = Flask(__name__)
app.secret_key = os.environ['SECRET_KEY']

DB_CONF = {
    'database': 'visnake',
    'username': os.environ.get('DB_USER', 'visnake-admin'),
    'pwd': os.environ['DB_PASSWORD'],
    'host': os.environ['DB_HOST']
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/highscores')
def highscores():
    return render_template(
        'highscores.html', top_monthly=top_ten_monthly(), top_all=top_ten_alltime())

@app.route('/score', methods=['GET', 'POST'])
def score():
    max_score = session.get('max_score', 0)
    last_score = session.get('last_score', 0)
    if request.method == 'GET':
        return jsonify({'max_score': max_score, 'last_score': last_score}), 200
    try:
        last_score = int(request.get_json()['score'])
        session['last_score'] = last_score
        if last_score > max_score:
            session['max_score'] = last_score
        return jsonify({'is_highscore' : is_highscore(last_score)}), 200
    except connector.Error as err:
        print(f'SQL Error in /score: {err}')
        return abort(500)
    except (ValueError, KeyError) as err:
        print(f'Key/Value error in /score: {err}')
        return abort(400)

@app.route('/add-to-highscore')
def add_to_highscore():
    if not 'usr' in request.args or not is_highscore(session['last_score']):
        return abort(400)
    conn = connect_db()
    try:
        cur = conn.cursor()
        cur.execute(
            'insert into highscore values (%s, %s, %s)',
            (
                request.args['usr'],
                session['last_score'],
                datetime.strftime(datetime.now(), '%Y-%m-%d')
            )
        )
        conn.commit()
        return '', 201
    except connector.Error as err:
        if err.errno == 1062:
            print('Not adding duplicate entry to server')
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

def is_highscore(add_score: int) -> bool:
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
        if cur.fetchall()[0][0] < add_score:
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

def top_ten_alltime() -> dict:
    conn = connect_db()
    cur = conn.cursor(dictionary=True)
    cur.execute('select * from top_ten_all')
    allscores = cur.fetchall()
    cur.close()
    return allscores

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
