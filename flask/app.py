# ライブラリのインポート
import hashlib  # パスワードをハッシュ値に変換するためのライブラリ
import sqlite3  # データベースを操作するためのライブラリ
from datetime import timedelta  # セッションの寿命を設定するためのライブラリ

from flask import redirect  # Flaskを使うためのライブラリ
from flask import Flask, flash, g, jsonify, render_template, request, session, url_for

DATABASE = "sample.db"  # データベースファイルの名前を指定
app = Flask(__name__, static_folder="./static")  # Flaskのインスタンスを作成
app.config["SECRET_KEY"] = "72224660711"  # port保護のためのキー。何でもいい


# データベース操作のための関数
# get_db: データベースへ接続する
# db_insert: データベースにデータを挿入する
# db_delete: データベースからデータを削除する
# db_get_json: データベースからデータを取得する
# db_update: データベースのデータを更新する
def get_db():  # DATABASEへ接続する
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db


def db_insert(table, data_obj):  # データベースにデータを挿入する
    # data_obj={key:value, key:value, ...} の形式でデータを渡す
    conn = get_db()
    cur = conn.cursor()
    query_str = f"INSERT INTO {table} ("
    values_str = ""
    values = []
    keys = data_obj.keys()
    for i in keys:
        query_str += i + ", "
        values_str += "?" + ", "
        values.append(data_obj[i])
    query_str = query_str[:-2]
    values_str = values_str[:-2]
    query_str += f") VALUES ({values_str})"
    try:
        cur.execute(query_str, values)
        conn.commit()  ## 更新はcommitが必要
        return True
    except sqlite3.Error as e:
        print("sqlite3.Error occurred at insert:", e.args[0])
        conn.commit()  ## 更新はcommitが必要
        return False


def db_delete(table, where):  # データベースからデータを削除する
    # where=sqlite3のwhere分と同じ形式
    conn = get_db()
    cur = conn.cursor()
    query_str = f"DELETE from {table} where {where}"
    try:
        cur.execute(query_str)
        conn.commit()  ## 更新はcommitが必要
        return True
    except sqlite3.Error as e:
        print("sqlite3.Error occurred at delete:", e.args[0])
        conn.commit()  ## 更新はcommitが必要
        return False


def db_get_json(table, query):  # データベースからデータを取得する
    # return: JSON形式のテーブルデータ[{key:value},{key:value},...]
    # query=sqlite3のquery文と同じ形式。""の場合は全てのデータを取得する
    # table=テーブル名。queryを書く場合は省略する

    return_json = []
    conn = get_db()
    cur = conn.cursor()
    query_str = query
    if query == "":
        query_str = "SELECT * FROM " + table
    try:
        records = cur.execute(query_str)
    except sqlite3.Error as e:
        print("doing query is: " + query)
        print("sqlite3.Error occurred at get:", e.args[0])
        return {}
    keys = []
    for num, record in enumerate(records):
        if num == 0:
            keys = record.keys()
        temp_obj = {}
        for index, val in enumerate(record):
            temp_obj[keys[index]] = val
        return_json.append(temp_obj)
    return return_json


def db_update(table, value, where):  # データベースのデータを更新する
    # value: key=value, key=value, ...の形式で書く
    # where: sqlite3のwhere文と同じ形式
    conn = get_db()
    cur = conn.cursor()
    query_str = f"UPDATE {table} SET {value} WHERE {where}"
    # print(query_str)
    try:
        cur.execute(query_str)
        conn.commit()  ## 更新はcommitが必要
        return True
    except sqlite3.Error as e:
        print("sqlite3.Error occurred at update:", e.args[0])
        conn.commit()  ## 更新はcommitが必要
        return False


@app.teardown_appcontext  # 特殊なエンドポイント。アプリ終了時に実行される
def close_connection(exception):  # アプリ終了時にデータベース接続を閉じる
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()


@app.before_request  # 特殊なエンドポイント。リクエストのたびに実行される
def before_request():  # リクエストのたびにセッションの寿命を更新する
    # 15分間操作がないと移動でログアウトする
    session.permanent = True
    app.permanent_session_lifetime = timedelta(minutes=15)
    session.modified = True


@app.route("/")  # ルートエンドポイント。adminユーザーの作成をし、ホーム画面を返す
def home():  # 最初URLでアクセスされた時の処理
    result = db_get_json(
        "", f"SELECT * FROM USERS u WHERE u.username='admin'"
    )  # adminユーザーが登録されているか確認する
    if result == []:  # adminユーザーが登録されていない場合、登録する
        h = hashlib.md5("admin".encode())  # パスワードは平文ではなくハッシュ値で暗号化する
        data_obj = {"username": "admin", "password": h.hexdigest()}
        db_insert("USERS", data_obj)  # データベースにadminユーザーを登録する

    if "user_id" not in session:  # セッションにuser_idがない場合、未ログインなのでusernameを渡さずにHTMLをレンダリング
        return render_template("home.html")
    else:  # セッションにuser_idがある場合、ログイン済みなのでusernameを渡してHTMLをレンダリング
        user_name_in_session = session["user_id"]
        result = db_get_json(
            "", f"SELECT * FROM USERS u WHERE u.username='{user_name_in_session}'"
        )  # sessionにいるユーザーが本当に登録されているか確認する
        if result == []:  # sessionにいるユーザーが登録されていない場合、セッションを削除して未ログイン状態にする
            session.pop("user_id", None)  # セッションからuser_idを削除する
            return render_template("home.html")
        else:  # sessionにいるユーザーが登録されている場合、ホーム画面を返す
            return render_template("home.html", username=session["user_id"])


@app.route(
    "/login", methods=["GET", "POST"]
)  # ログインエンドポイント。GET=ログインページを返す。POST=ログイン処理を行う
def login():  # ログインページへアクセスがあった時の処理
    if "user_id" in session:  # セッションにuser_idがある場合、ログイン済みなのでホーム画面にリダイレクトする
        return redirect(url_for("home"))

    if request.method == "GET":  # ログインエンドポイントにGETリクエストがあった時。すなわちログインページを表示したい場合
        return render_template(
            "login.html", error=None
        )  # ログイン画面が欲しいというGETリクエストがあった場合、ログイン画面を返す

    elif request.method == "POST":  # ログインエンドポイントにPOSTリクエストがあった時。すなわちログインボタンが押された場合
        username = request.form["username"]  # フォームの内容を取得する
        password = request.form["password"]  # フォームの内容を取得する
        h = hashlib.md5(password.encode())  # パスワードは平文ではなくハッシュ値で暗号化する
        result = db_get_json(
            "",
            f"SELECT * FROM USERS WHERE username = '{username}' AND password = '{h.hexdigest()}'",
        )  # ユーザー名とパスワードが一致するデータがデータベースにあるかを確認
        if result == []:  # データベースに無かった場合
            return render_template(
                "login.html", error="Invalid username or password"
            )  # ログイン失敗。エラーメッセージと共にログイン画面へ戻る
        else:  # データベースにあった場合
            session["user_id"] = username  # ユーザ認証された場合、セッションに記録する
            flash("Logged in")  # flashメッセージを設定する（簡易的なポップアップ通知）
            return redirect(url_for("home"))  # ホーム画面に戻る


@app.route(
    "/signup", methods=["GET", "POST"]
)  # サインアップエンドポイント。GET=サインアップページを表示。POST=サインアップ処理
def signup():  # ユーザー登録のためのページ
    request_valid = True  # フォームの内容を取得し、バリデーションを行うためのフラグ

    if request.method == "GET":  # サインアップエンドポイントにGETリクエストがあった時。すなわちサインアップページを表示したい場合
        return render_template("signup.html")  # GETリクエストがあった場合、サインアップ画面を返す

    elif request.method == "POST":  # ユーザー登録ボタンが押された場合
        username = request.form["username"]  # フォームの内容を取得する
        password = request.form["password"]  # フォームの内容を取得する
        confirm = request.form["confirm"]  # フォームの内容を取得する
        if not username:  # ユーザー名が入力されていない場合、エラーメッセージを表示する
            flash("ユーザー名を入力してください")
            request_valid = False
        if not password:  # パスワードが入力されていない場合、エラーメッセージを表示する
            flash("パスワードを入力してください")
            request_valid = False
        if password != confirm:  # パスワードと確認用のパスワードが一致しない場合、エラーメッセージを表示する
            flash("確認用のパスワードが一致しません")
            request_valid = False

        if request_valid == False:  # フォームの入力に問題があった場合
            return render_template("signup.html")

        else:  # フォームの入力に問題がなかった場合
            result = db_get_json(
                "", f"SELECT * FROM USERS u WHERE u.username='{username}'"
            )  # USERSテーブルから、usernameが一致するユーザーを取得する
            if result != []:  # 検索結果がヒットした場合。すなわち既に同じユーザー名が登録されている場合、エラーメッセージを表示する
                flash("This username is already taken")
                return render_template("signup.html")  # サインアップできなかったので、サインアップ画面を返す
            else:  # 検索結果がヒットしなかった場合。すなわち入力されたユーザー名が登録されていない場合
                h = hashlib.md5(password.encode())  # パスワードは平文ではなくハッシュ値で暗号化する
                data_obj = {
                    "username": username,
                    "password": h.hexdigest(),
                }  # 登録する内容をまとめる
                db_insert("USERS", data_obj)  # データベースにユーザー情報を追加する
                return redirect(url_for("login"))  # ログインページにリダイレクトする


@app.route("/logout")  # ログアウトエンドポイント。リクエストの種類に関わらずログアウト処理を行う
def logout():  # ログアウト処理
    if session.pop("user_id", None):  # セッションからユーザーIDを削除する
        flash("ログアウトしました")  # flashメッセージを設定する（簡易的なポップアップ通知）
    return redirect(url_for("home"))  # ログアウト後はホームにリダイレクトする。


@app.route("/game", methods=["GET"])  # ゲームエンドポイント。GET=ゲーム画面を表示
def game():  # ゲーム画面の表示
    if "user_id" not in session:  # ログインしていない場合
        return redirect(url_for("login"))  # ログイン画面に移動する
    return render_template("game.html")  # (GETリクエストの場合)ゲーム画面を表示する


@app.route("/save_escape_time", methods=["POST"])  # ゲームデータをセーブするエンドポイント。POST=ゲームデータを記録
def save_escape_time():  # ゲームデータをセーブする処理
    data = request.json  # postされたデータ(json)を取得
    escape_time = data["escapeTime"]  # ゲームの逃れた時間を取得
    history = db_get_json("GAMELOGS", "")  # データベースからゲームデータの履歴を取得

    if len(history) > 0:  # データベースに履歴が既にある場合(複数行のユーザー別履歴がある)
        for i in history:  # それぞれの履歴を確認する
            if i["username"] == session["user_id"]:  # ログイン中のユーザーと同じユーザー名の履歴がある場合
                if float(i["time"]) < float(escape_time):  # 履歴にある逃れた時間が、新しい結果より短い場合
                    user_name_in_session = session["user_id"]  # ログイン中のユーザー名を取得
                    db_update(
                        "GAMELOGS",
                        "time=" + str(escape_time),
                        f"username='{user_name_in_session}'",
                    )  # データベースの履歴をいい結果の方へ更新する
                    i["time"] = escape_time  # JavaScriptに返す用にhistoryを更新
                    return jsonify(
                        {
                            "message": "update: 逃れた時間を受け取りました。",
                            "json": history,
                        }
                    )  # JavaScriptに結果を返す

                # 履歴にある逃れた時間が、新しい結果より長い場合
                return jsonify(
                    {"message": "none: 逃れた時間を受け取りました。", "json": history}
                )  # 何もゲームデータ履歴を変更せず、JavaScriptに結果を返す
        else:
            # ログイン中のユーザーと同じユーザー名の履歴がない場合
            db_insert(
                "GAMELOGS", {"username": session["user_id"], "time": escape_time}
            )  # 新規でデータベースに履歴を追加する
            history.append(
                {"username": session["user_id"], "time": escape_time}
            )  # JavaScriptに返す用にhistoryに追加
            return jsonify(
                {"insert: message": "逃れた時間を受け取りました。", "json": history}
            )  # JavaScriptに結果を返す

    else:  # データベースに履歴がない場合
        db_insert(
            "GAMELOGS", {"username": session["user_id"], "time": escape_time}
        )  # データベースにゲームデータを新規で追加する
        history.append(
            {"username": session["user_id"], "time": escape_time}
        )  # JavaScriptに返す用にhistoryに追加
        return jsonify(
            {"message": "insert: 逃れた時間を受け取りました。", "json": history}
        )  # JavaScriptに結果を返す


@app.route("/vote", methods=["GET", "POST"])  # 投票エンドポイント。GET=投票ページを返す。POST=投票処理を行う
def vote():  # 投票画面の表示と、投票処理
    if "user_id" not in session:  # ログインしていない場合
        return redirect(url_for("login"))  # ログイン画面に移動する

    # グラフ描画用のデータをデータベースから取得する。編集前（現在）の投票データ
    labels = ""  # グラフのラベル
    values = ""  # グラフの値
    result = db_get_json("VOTES", "")  # データベースから投票結果を取得
    vote_values = {}  # 上で取得した投票結果を辞書形式で格納する辞書(後でflashメッセージを送る時に便利)
    for i in result:  # 投票結果を1つずつ確認する
        title = i["title"]  # 投票項目の名前
        num = int(i["num"])  # 投票数
        labels += f"{title},"  # グラフのラベルに追加
        values += f"{num},"  # グラフの値に追加
        vote_values[title] = num  # 辞書に追加
    labels = labels[:-1]  # 最後のカンマを削除
    values = values[:-1]  # 最後のカンマを削除
    graph_data = {  # グラフ表示用のデータ。JavaScriptに送るためにObject形式に整形している
        "chart_labels": labels,
        "chart_data": values,
        "chart_title": "",
        "chart_target": "",
    }

    if request.method == "GET":  # GETリクエストがあった場合。投票画面を表示するだけ
        return render_template(
            "vote.html", form={}, graph_data=graph_data
        )  # グラフ表示用のデータとともに投票ページを表示する

    elif request.method == "POST":  # POSTリクエストがあった場合。すなわち投票があった場合
        selected = request.form["vote"]  # どの投票ボタンが選択されたかを取得
        flash(
            f"投票しました\n{selected}: {vote_values[selected]}→{vote_values[selected]+1}"
        )  # 投票完了のメッセージを送る。投票処理後なのでvote_values[selected]+1を表示。
        db_update(
            "VOTES", f"num={vote_values[selected]+1}", f"title='{selected}'"
        )  # 選択された投票項目の投票数を1増やす

        return redirect(url_for("vote"))  # voteエンドポイントにGETリダイレクトする(こうすることで画面の再描画が楽に行える)


if __name__ == "__main__":
    app.run(debug=True)  # デバッグモードでプログラム全体を起動
