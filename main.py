from flask import Flask, render_template, request, g, redirect, url_for, session, flash

app = Flask(__name__ , static_folder='./static')

@app.route('/')
def index():
    return "Hallo World!"

if __name__ == '__main__':
    app.debug = True
    app.run()
