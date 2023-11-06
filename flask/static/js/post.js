// PUTリクエストを送信したいURLを指定
const url = 'https://ux3v87sf1e.execute-api.us-east-1.amazonaws.com/get_point_info';

// 送信するデータ（オブジェクト）を準備
const data = {
  method: 'put',
  item:{
    user_id: "1",
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
