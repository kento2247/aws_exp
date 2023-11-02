document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  let gameStartTime; // ゲームの開始時刻を格納する変数
  let mouseX = canvas.width / 2;
  let mouseY = canvas.height / 2;
  const redDotSize = 30;

  const enemies = []; // enemyの配列
  let gameHistoryData = [];

  for (let i = 0; i < 2; i++) {
    enemies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 40,
      speed: i === 0 ? 3 : 7, // ふたつのenemyの移動速度を異なる値にする
    });
  }

  let isGameOver = false;

  function startGame() {
    gameStartTime = new Date();
    updateGame();
  }

  function drawRedDot() {
    ctx.font = `${redDotSize}px FontAwesome`;
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\uf113", mouseX, mouseY); // ここで赤い円をFontAwesomeのアイコンに変更
  }

  function drawEnemy() {
    ctx.font = `${enemies[0].size}px FontAwesome`;
    ctx.fillStyle = "blue";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\uf188", enemies[0].x, enemies[0].y);

    ctx.font = `${enemies[1].size}px FontAwesome`;
    ctx.fillText("\uf188", enemies[1].x, enemies[1].y);
  }

  function drawGameOverMessage() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);

    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Click to restart", canvas.width / 2, canvas.height / 2 + 40);
  }

  function checkCollision() {
    for (const enemy of enemies) {
      const dx = mouseX - enemy.x;
      const dy = mouseY - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < enemy.size + redDotSize) {
        isGameOver = true;
        break; // 衝突が1つでもあればゲームオーバーとする
      }
    }
  }

  function displayLeaderboard() {
    const leaderboardElement = document.getElementById("leaderboard");
    leaderboardElement.innerHTML = ""; // リセット

    console.log("ゲーム履歴データ", gameHistoryData);
    // 時間の昇順にゲーム履歴をソート
    gameHistoryData.sort((a, b) => parseFloat(b.time) - parseFloat(a.time));

    // 順位を表示
    for (let i = 0; i < gameHistoryData.length; i++) {
      const rank = i + 1;
      const time = gameHistoryData[i].time;
      const username = gameHistoryData[i].username;

      // フォントアイコンを使用して順位を表示
      const rankIcon = getRankIcon(rank);

      // 順位情報をHTMLに追加
      leaderboardElement.innerHTML += `<p>${rankIcon} ${rank}位: ${username} (${time} 秒)</p>`;
    }
  }
  // 順位に対応するフォントアイコンを取得
  function getRankIcon(rank) {
    switch (rank) {
      case 1:
        return '<i class="fas fa-crown" style="color: gold;"></i>';
      case 2:
        return '<i class="fas fa-medal" style="color: silver;"></i>';
      case 3:
        return '<i class="fas fa-medal" style="color: brown;"></i>';
      default:
        return `<span style="font-size: 16px;">${rank}.</span>`;
    }
  }

  function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isGameOver) {
      drawRedDot();
      drawEnemy();
      moveEnemies();
      checkCollision();
      requestAnimationFrame(updateGame);
    } else {
      drawGameOverMessage();
      const escapeTimeInSeconds = (new Date() - gameStartTime) / 1000; // 逃れた時間を秒で計算

      // 逃れた時間をサーバーにPOSTリクエストで送信
      sendEscapeTime(escapeTimeInSeconds);
    }
  }

  function moveEnemies() {
    for (const enemy of enemies) {
      const dx = mouseX - enemy.x;
      const dy = mouseY - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > enemy.size + redDotSize) {
        enemy.x += (dx / distance) * enemy.speed;
        enemy.y += (dy / distance) * enemy.speed;
      }
    }
  }

  function restartGame() {
    isGameOver = false;
    mouseX = canvas.width / 2;
    mouseY = canvas.height / 2;
    for (const enemy of enemies) {
      enemy.x = Math.random() * canvas.width;
      enemy.y = Math.random() * canvas.height;
    }
    updateGame();
  }

  function sendEscapeTime(escapeTimeInSeconds) {
    fetch("/save_escape_time", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ escapeTime: escapeTimeInSeconds }),
    })
      .then((response) => response.json()) // レスポンスをJSON形式で解析
      .then((data) => {
        // サーバーからのデータ（JSON）を取得して処理
        console.log(data); // 例：{'message': '逃れた時間を受け取りました。'}
        gameHistoryData = data["json"];
        displayLeaderboard();
      })
      .catch((error) => {
        console.error("エラー:", error);
      });
  }

  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
  });

  canvas.addEventListener("click", () => {
    if (isGameOver) {
      startGame();
      restartGame();
    }
  });

  startGame();
  updateGame();
});
