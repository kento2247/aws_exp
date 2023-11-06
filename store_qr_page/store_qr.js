function getLocation() {
  if (navigator.geolocation) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          resolve(`${latitude},${longitude}`);
        },
        function (error) {
          reject(error.message);
        }
      );
    });
  } else {
    return Promise.reject("Geolocation is not supported by this browser.");
  }
}

function updateQRUrl(serviceId) {
  document.getElementById(
    "qr_url"
  ).value = `https://example.com/?service_id=${serviceId}`;
}

// QRコードスキャナの初期化
const scanner = new Instascan.Scanner({
  video: document.getElementById("preview"), // ビデオ要素を指定
});

// QRコードスキャナを開始
scanner.addListener("scan", function (content) {
  // QRコードスキャンの結果を取得
  const serviceId = content; // 仮のserviceId
  updateQRUrl(serviceId);

  // QRコードスキャン結果をフォームに反映
  document.getElementById("qrScanner").style.display = "none";
});

scanner.start(); // QRコードスキャナを開始

document
  .getElementById("pointForm")
  .addEventListener("submit", function (event) {
    // ...（以前のコードと同じ）
  });
