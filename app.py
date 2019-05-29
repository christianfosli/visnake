import os
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
    return render_template('highscores.html')

@app.route('/score', methods=['GET', 'POST'])
def score():
    max_score = session.get('max_score', 0)
    if request.method == 'GET':
        return jsonify({'score' : max_score}), 200
    try:
        req_score = int(request.get_json()['score'])
        if int(req_score) > max_score:
            session['max_score'] = req_score
        return '', 200
    except (ArithmeticError) as err:
        print(f'Error in /score -- {err}')
        return abort(400)
