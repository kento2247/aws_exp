from flask import Flask, render_template, request, g, redirect, url_for, session, flash

app = Flask(__name__ , static_folder='./static')
app.config['SECRET_KEY'] = '1234'


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    return render_template('login.html')

@app.route('/user_qr')
def user_qr():
    return render_template('user_qr.html')

@app.route('/bake_qr')
def bake_qr():
    return render_template('bake_qr.html')

if __name__ == '__main__':
  app.run(host = '0.0.0.0', port = 5000)
  app.debug = True
