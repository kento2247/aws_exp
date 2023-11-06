window.onload = function () {
  var items = JSON.parse(localStorage.getItem("items")),//ローカルストレージの商品データの配列
  ele = document.getElementById('js_shopping_list'),//カートの商品を追加する要素
  fragment = document.createDocumentFragment(),//DOMの追加処理用のフラグメント
  total = 0,//商品の合計金額
  total_ele = document.getElementById('js_total'),//商品の合計金額表示用の要素
  confirm_btn = document.getElementById('js_confirm');//購入確定ボタン

  if (items) {
    // カート商品の数分、要素を作成
    for (var i = 0; i < items.length; i++) {
      var li = document.createElement('li'),
      h2 = document.createElement('h2'),
      price = document.createElement('div');

      price.classList.add('price');
      
      h2.appendChild(document.createTextNode(items[i].name));
      price.appendChild(document.createTextNode(items[i].price));
      li.appendChild(h2);
      li.appendChild(price);
      fragment.appendChild(li);

      // 合計金額を加算
      total = total + items[i].price;
    }
  }

  // 作成した要素の追加
  ele.appendChild(fragment);
  // 合計金額の表示
  total_ele.innerHTML = total;

  confirm_btn.addEventListener('click',function () {
    // window.alert('購入が確定しました。');
    window.location.href = ('user_qr.html')
    localStorage.removeItem('items');
  });

};
