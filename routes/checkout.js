const express = require('express');
const router = express.Router();
const CheckoutModel = require('../models/CheckoutModel');
const { Iamporter, IamporterError } = require('iamporter');
const iamporter = new Iamporter({
  apiKey: '0765376472603732',
  secret: 'VqGF8yc8gTIABm0jAFnUoGaSIOWR5tm1U3G2BTaSMTsoftHQ85LwLWouKllQPIRKLyMmrXfeQIC6bjWk'
});
const request = require('request');
const cheerio = require('cheerio');
const removeEmpty = require('../libs/removeEmpty');

router.get('/' , function(req, res){

  let totalAmount = 0; //총결제금액
  let cartList = {}; //장바구니 리스트
  //쿠키가 있는지 확인해서 뷰로 넘겨준다
  if( typeof(req.cookies.cartList) !== 'undefined'){
    //장바구니데이터
    cartList = JSON.parse(unescape(req.cookies.cartList));

    //총가격을 더해서 전달해준다.
    for( let key in cartList) {
      totalAmount += parseInt(cartList[key].amount);
    }
  }
  res.render('checkout/index', { cartList : cartList , totalAmount : totalAmount } );
});

router.get('/complete', async (req, res) => {
  try {
    const payData = await iamporter.findByImpUid(req.query.imp_uid);
    const checkout = new CheckoutModel({
      imp_uid : payData.data.imp_uid,
      merchant_uid : payData.data.merchant_uid,
      paid_amount : payData.data.amount,
      apply_num : payData.data.apply_num,

      buyer_email : payData.data.buyer_email,
      buyer_name : payData.data.buyer_name,
      buyer_tel : payData.data.buyer_tel,
      buyer_addr : payData.data.buyer_addr,
      buyer_postcode : payData.data.buyer_postcode,

      status : "결재완료",
    });

    await checkout.save();

    res.redirect('/checkout/success');
  } catch (e) {
    res.send('error!!');
  }
});

router.post('/complete', (req,res) => {
  const checkout = new CheckoutModel({
    imp_uid : req.body.imp_uid,
    merchant_uid : req.body.merchant_uid,
    paid_amount : req.body.paid_amount,
    apply_num : req.body.apply_num,

    buyer_email : req.body.buyer_email,
    buyer_name : req.body.buyer_name,
    buyer_tel : req.body.buyer_tel,
    buyer_addr : req.body.buyer_addr,
    buyer_postcode : req.body.buyer_postcode,

    status : req.body.status,
  });

  checkout.save(function(err){
    res.json({message:"success"});
  });

});

router.post('/mobile_complete', (req,res)=>{
  const checkout = new CheckoutModel({
    imp_uid : req.body.imp_uid,
    merchant_uid : req.body.merchant_uid,
    paid_amount : req.body.paid_amount,
    apply_num : req.body.apply_num,

    buyer_email : req.body.buyer_email,
    buyer_name : req.body.buyer_name,
    buyer_tel : req.body.buyer_tel,
    buyer_addr : req.body.buyer_addr,
    buyer_postcode : req.body.buyer_postcode,

    status : req.body.status,
  });

  checkout.save(function(err){
    res.json({message:"success"});
  });
});

router.get('/success', function(req,res){
  res.render('checkout/success');
});

router.get('/nomember', function(req,res){
  res.render('checkout/nomember');
});

router.get('/nomember/search', function(req,res){
  CheckoutModel.find({ buyer_email : req.query.email }, function(err, checkoutList){
    res.render('checkout/search', { checkoutList : checkoutList } );
  });
});

router.get('/shipping/:invc_no', (req, res) => {
  const url = "https://www.doortodoor.co.kr/parcel/doortodoor.do?fsp_action=PARC_ACT_002&fsp_cmd=retrieveInvNoACT&invc_no=" + req.params.invc_no ;
  const result = [];

  request(url, (error, response, body) => {
    const $ = cheerio.load(body, { decodeEntities: false });
    const tdElements = $(".board_area").find("table.mb15 tbody tr td");

    let temp = {};
    for( let i = 0; i < tdElements.length; i++ ){
      if(i % 4 === 0){
        temp["step"] = removeEmpty(tdElements[i].children[0].data);
      } else if (i % 4 === 1) {
        temp["date"] = tdElements[i].children[0].data;
      } else if (i % 4 === 2) {
        temp["status"] = tdElements[i].children[0].data;
        if (tdElements[i].children.length>1){
          temp["status"] += tdElements[i].children[2].data;
        }
      } else if (i % 4 === 3){
        temp["location"] = tdElements[i].children[1].children[0].data;
        result.push(temp);
        temp = {};
      }
    }

    res.render( 'checkout/shipping' , { result : result }); //최종값 전달
  });
});

module.exports = router;