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
    console.log("QRcodeが見つかりました", code);
    drawRect(code.location);
    document.getElementById("qr-msg").textContent = `QRコード：${code.data}`;
  } else {
    console.log("QRcodeが見つかりません…", code);
    rectCtx.clearRect(0, 0, contentWidth, contentHeight);
    document.getElementById("qr-msg").textContent = `QRコード: 見つかりません`;
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
