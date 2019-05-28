from flask import Flask, render_template, request, jsonify, session, abort

app = Flask(__name__)
app.secret_key = b'\x13\xee\x87\xf7E\x01\xc9\xac5\xaf\x1c\xe2w\xb8(\xc1\xea^\xd9\xb4\xfc\xb5l'

@app.route('/')
def index():
    return render_template('index.html')

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
