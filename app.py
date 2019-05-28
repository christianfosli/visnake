from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
app.secret_key = b'\x13\xee\x87\xf7E\x01\xc9\xac5\xaf\x1c\xe2w\xb8(\xc1\xea^\xd9\xb4\xfc\xb5l'

@app.route('/')
def index():
    return render_template('index.html')
