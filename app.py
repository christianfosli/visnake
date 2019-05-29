#!/usr/bin/env python3

import os
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session, abort
from mysql import connector

app = Flask(__name__)
app.secret_key = os.environ['SECRET_KEY']

DB_CONF = {
    'database': 'visnake',
    'username': 'visnake-admin',
    'pwd': os.environ['DB_PASSWORD'],
    'host': os.environ['DB_HOST']
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/highscores')
def highscores():
    return render_template('highscores.html',
        top_monthly=top_ten_monthly(), top_all=top_ten_alltime())

@app.route('/score', methods=['GET', 'POST'])
def score():
    max_score = session.get('max_score', 0)
    if request.method == 'GET':
        return jsonify({'score' : max_score}), 200
    try:
        req_score = int(request.get_json()['score'])
        if int(req_score) > max_score:
            session['max_score'] = req_score
        return jsonify({'is_highscore' : is_highscore(max_score)}), 200
    except (ValueError, KeyError) as err:
        print(f'Error in /score -- {err}')
        return abort(400)

@app.route('/add-to-highscore')
def add_to_highscore():
    if not 'usr' in request.args or not is_highscore(session['max_score']):
        abort(400)
    conn = connect_db()
    try:
        cur = conn.cursor()
        cur.execute(
            'insert into highscore values (%s, %s, %s)',
            (
                request.args['usr'],
                session['max_score'],
                datetime.strftime(datetime.now(), '%Y-%m-%d')
            )
        )
        conn.commit()
    finally:
        conn.close()
        return '', 200

@app.route('/top-month')
def top_monthly_json():
    return jsonify(top_ten_monthly())

@app.route('/top-all')
def top_all_json():
    return jsonify(top_ten_alltime())

def is_highscore(add_score: int) -> bool:
    conn = connect_db()
    try:
        cur = conn.cursor()
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
        cur.close()
    finally:
        conn.close()

def top_ten_monthly() -> list:
    conn = connect_db()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute('select * from top_ten_month')
        monthly = cur.fetchall()
        cur.close()
        return monthly
    finally:
        conn.close()

def top_ten_alltime() -> dict:
    conn = connect_db()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute('select * from top_ten_all')
        all = cur.fetchall()
        cur.close()
        return all
    finally:
        conn.close()

def connect_db():
    return connector.connect(
        user=DB_CONF['username'],
        password=DB_CONF['pwd'],
        host=DB_CONF['host'],
        database=DB_CONF['database']
    )

if __name__ == '__main__':
    app.run()
