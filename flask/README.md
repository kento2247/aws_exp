# セットアップ
1. [git](https://git-for-windows.github.io/)をインストールする

2. 以下を実行（プログラムをコピー: 初回のみ）+VScodeで開く
   
   `cd ~/Downloads`
   
   `git clone https://github.com/kento2247/flask-app.git`

   `code ./flask-app/`

4. [VScode](https://code.visualstudio.com/)がインストールされていなければ、インストールする

5. python がインストールされているかを以下のコマンドで確認

   `python -V`

   - もし Python 3._.__と表示されなければ

      - Pyhonをインストールする
        
        Windows app storeから最新のPythonをインストール
   
      - 再び以下のコマンドを実行して、インストールされているか確認
   
         ```python -V```

6. Flask をインストールする

   `pip install flask`

   - ちゃんとインストールできてるかを確認
     
     ```pip list```

7. sqlite3をインストールする
   - [sqlite3.zip](https://github.com/kento2247/flask-app/files/12208010/sqlite3.zip)をダウンロード
   - Cドライブ直下やルートディレクトリなど、普段使わないところに解凍したsqlite3フォルダを置く
   - sqlite3フォルダを右クリックして、「パスをコピー」を押す
   - 「設定」→「検索」→「環境変数」→「ユーザー環境変数 / PATH」→「編集」→「追加」
   - 2個前でコピーしたパスをペーストして保存

# 最新のプログラムが欲しい場合
   1. `cd ~/Downloads`
   2. `cd ./flask-app/`
   3. `git pull`
   
   を実行する。
   - もしエラーが起きたら

      `git stash`
   
      を実行してみる。
   - 何回かyを入力しないといけないはず。
   
      それでも無理だったらフォルダアプリから、C: Downloadsに移動して、flask-appフォルダを消す！
   
# レポート
   - [Wordの共有リンク](https://keiojp0-my.sharepoint.com/:w:/g/personal/tkento1985_keio_jp/EXIAmY-0t0VHnbNWCRw3hiIBHRZvS4HxlJbRcCiK9xUU2A?e=nSaDIr)
     > もしブラウザでwordが立ち上がってしまう場合
     > 1. ブラウザ内でofficeアカウントにログインする
     > 2. ログイン後は「編集」ボタンを押すと、「デスクトップアプリで開く」ボタンが表示されるはず!
     > <img width="1280" alt="image" src="https://github.com/kento2247/flask-app/assets/42343541/bcaa0910-0676-4ecd-825e-ab14f8f2e645">

   - [手書きの説明.pdf](https://github.com/kento2247/flask-app/files/12209317/default.pdf)



# to-do
   - [x] 終わったらこれみたいに[ ]の中にxを入れる！
   - [ ] layout.htmlのtitleを変える
   - [ ] home.htmlのtitleを変える
   - [ ] home.htmlのコンテンツを編集する
   - [ ] voteの内容を変える
   - [ ] voteのアイコンを変える
