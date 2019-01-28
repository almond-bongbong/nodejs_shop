const express = require('express');
const router = express.Router();

router.get('/' , (req, res) => {
  let totalAmount = 0;
  let cartList = {}; //장바구니 리스트
  //쿠키가 있는지 확인해서 뷰로 넘겨준다
  if(req.cookies.cartList){
    //장바구니데이터
    cartList = JSON.parse(unescape(req.cookies.cartList));
    //총가격을 더해서 전달해준다.
    const has = Object.prototype.hasOwnProperty;
    for( let key in cartList){
      if (has.call(cartList, key)) {
        totalAmount += parseInt(cartList[key].amount);
      }
    }
  }
  res.render('cart/index', { cartList : cartList , totalAmount : totalAmount } );
});


module.exports = router;