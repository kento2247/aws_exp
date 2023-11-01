from flask import Flask, render_template, request, g, redirect, url_for, session, flash
from datetime import timedelta

app = Flask(__name__ , static_folder='./static')
app.config['SECRET_KEY'] = '1234'

# @app.before_request
# def before_request():
#     # リクエストのたびにセッションの寿命を更新する
#     session.permanent = True
#     app.permanent_session_lifetime = timedelta(minutes=15)
#     session.modified = True


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    # if request.method == 'POST':
    #     if request.form['username'] == 'admin':
    #         session['username'] = request.form['username']
    #         return redirect(url_for('index'))
    #     else:
    #         flash('Invalid username or password')
    return render_template('login.html')

@app.route('/user_qr')
def user_qr():
    return render_template('user_qr.html')

@app.route('/bake_qr')
def bake_qr():
    return render_template('bake_qr.html')

if __name__ == '__main__':
    app.debug = True
    app.run()
