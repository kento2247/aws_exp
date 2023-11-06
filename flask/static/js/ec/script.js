window.onload = function () {
  var cart_btns = document.querySelectorAll('.js_cart_btn'),//カートボタン
  cart_cnt_icon = document.getElementById('js_cart_cnt'),//カートの個数アイコン
  cart_cnt = 0,//カートのアイテム数
  clicked = [],//クリックされたカートアイコンのインデックス
  save_items = [],//ローカルストレージ保存用の配列
  items = JSON.parse(localStorage.getItem("items"));//ローカルストレージの商品データ配列

  // すでにカートに商品が入っている場合、カートアイコンのカウント表示とカートボタンをアクティブにする
  if (items) {
    var id;
    for (var i = 0; i < items.length; i++) {
      id = items[i].id;
      save_items.push(items[i]);
      clicked.push(id);
      activate_btn(id);
    }

    if(items.length != 0){
      cart_cnt_icon.parentNode.classList.remove('hidden');
      cart_cnt_icon.innerHTML = cart_cnt;
    }
  }

  // カートボタンを押した際の処理
  cart_btns.forEach(function (cart_btn,index) {
    cart_btn.addEventListener('click',function () {

      // カートボタンがすでに押されているかの判定
      if (clicked.indexOf(index) >= 0) {

        for (var i = 0; i < clicked.length; i++) {
          if(clicked[i] == index){
            clicked.splice(i, 1);
            save_items.splice(i, 1);
          }
        }

        inactivate_btn(index);

      }else if(clicked.indexOf(index) == -1){

        var name = cart_btn.dataset.name,//商品の名前を取得
        price = Number(cart_btn.dataset.price);//商品の値段を取得

        clicked.push(index);
        save_items.push({
          id: index,
          name: name,
          price: price
        });

        activate_btn(index);

      }

      // ローカルストレージに商品データを保管
      localStorage.setItem("items",JSON.stringify(save_items));

    });
  });

  function activate_btn(index) {
    cart_cnt++;
    if( cart_cnt >= 1 ){
      cart_cnt_icon.parentNode.classList.remove('hidden');
    }
    cart_cnt_icon.innerHTML = cart_cnt;
    cart_btns[index].classList.add('item_cart_btn_active');
  }

  function inactivate_btn(index) {
    cart_cnt--;
    if(cart_cnt == 0){
      cart_cnt_icon.parentNode.classList.add('hidden');
    }
    cart_cnt_icon.innerHTML = cart_cnt;
    cart_btns[index].classList.remove('item_cart_btn_active');
  }

};




