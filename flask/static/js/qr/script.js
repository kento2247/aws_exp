// Webカメラの起動
const video = document.getElementById("video");
let contentWidth;
let contentHeight;

const media = navigator.mediaDevices
  .getUserMedia({ audio: false, video: { width: 640, height: 480 } })
  .then((stream) => {
    video.srcObject = stream;
    video.onloadeddata = () => {
      video.play();
      contentWidth = video.clientWidth;
      contentHeight = video.clientHeight;
      canvasUpdate();
      checkImage();
    };
  })
  .catch((e) => {
    console.log(e);
  });

// カメラ映像のキャンバス表示
const cvs = document.getElementById("camera-canvas");
const ctx = cvs.getContext("2d");
const canvasUpdate = () => {
  cvs.width = contentWidth;
  cvs.height = contentHeight;
  ctx.drawImage(video, 0, 0, contentWidth, contentHeight);
  requestAnimationFrame(canvasUpdate);
};


const putMethod = (code) =>{
  const url = 'https://ux3v87sf1e.execute-api.us-east-1.amazonaws.com/get_point_info';
  // 送信するデータ（オブジェクト）
  let code_data = code.data;
  const data = {
    method: 'put',
    item:{
      user_id: `${code_data}`,
      timestamp: "2023-11-06T03:13:09.406Z",
      active_flag: true,
      bonus: "4",
      location: "35.555428820777166,139.65397644394386",
      point: "-10",
    }
  };

  // オプションを設定
  const options = {
    method: 'POST', // HTTPメソッドをPUTに設定
    headers: {
      'Content-Type': 'application/json', // 送信データの形式をJSONに設定
    },
    body: JSON.stringify(data), // データをJSON文字列に変換して送信
  };

  // PUTリクエストを送信
  fetch(url, options)
    .then(response => {
      if (response.ok) {
        return response.json(); // 応答をJSON形式で解析
      } else {
        throw new Error('PUTリクエストに失敗しました');
      }
    })
    .then(data => {
      console.log('成功:', data);
    })
    .catch(error => {
      console.error('エラー:', error);
    });
};

// QRコードの検出
const rectCvs = document.getElementById("rect-canvas");
const rectCtx = rectCvs.getContext("2d");
const checkImage = () => {
  // imageDataを作る
  const imageData = ctx.getImageData(0, 0, contentWidth, contentHeight);
  // jsQRに渡す
  const code = jsQR(imageData.data, contentWidth, contentHeight);

  // 検出結果に合わせて処理を実施
  if (code) {
    console.log("QRcode is found", code);
    drawRect(code.location);
    document.getElementById("qr-msg").textContent = `QR code: ${code.data}`;
    putMethod(code)
    window.open(code.data);
  } else {
    console.log("QRcode is not found", code);
    rectCtx.clearRect(0, 0, contentWidth, contentHeight);
    document.getElementById("qr-msg").textContent = "QR code is not found.";
  }
  setTimeout(() => {
    checkImage();
  }, 500);
};

// 四辺形の描画
const drawRect = (location) => {
  rectCvs.width = contentWidth;
  rectCvs.height = contentHeight;
  drawLine(location.topLeftCorner, location.topRightCorner);
  drawLine(location.topRightCorner, location.bottomRightCorner);
  drawLine(location.bottomRightCorner, location.bottomLeftCorner);
  drawLine(location.bottomLeftCorner, location.topLeftCorner);
};

// 線の描画
const drawLine = (begin, end) => {
  rectCtx.lineWidth = 4;
  rectCtx.strokeStyle = "#F00";
  rectCtx.beginPath();
  rectCtx.moveTo(begin.x, begin.y);
  rectCtx.lineTo(end.x, end.y);
  rectCtx.stroke();
};
