const express = require('express');
const router = express.Router();
const ProductsModel = require('../models/ProductsModel');
const CommentsModel = require('../models/CommentsModel');
const CheckoutModel = require('../models/CheckoutModel');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const path = require('path');
const uploadDir = path.join( __dirname , '../uploads' ); // 루트의 uploads위치에 저장한다.
const fs = require('fs');
const paginate = require('express-paginate');

//multer 셋팅
const multer  = require('multer');
const storage = multer.diskStorage({
  destination : (req, file, callback) => { //이미지가 저장되는 도착지 지정
    callback(null, uploadDir );
  },
  filename : (req, file, callback) => { // products-날짜.jpg(png) 저장
    callback(null, 'products-' + Date.now() + '.'+ file.mimetype.split('/')[1] );
  }
});
const upload = multer({ storage: storage });

router.get('/', (req, res) => {
  res.send('hello admin');
});

router.get('/products', paginate.middleware(10, 50), async (req, res) => {
  const [ results, itemCount ] = await Promise.all([
    ProductsModel.find().sort('-created_at, -id').limit(req.query.limit).skip(req.skip),
    ProductsModel.count(),
  ]);
  const pageCount = Math.ceil(itemCount / req.query.limit);
  const pages = paginate.getArrayPages(req)(5, pageCount, req.query.page);

  res.render('admin/products', {
    products: results,
    pages: pages,
    pageCount: pageCount,
  });
});

router.get('/products/write', csrfProtection, (req, res) => {
  res.render('admin/form', { product: '', csrfToken: req.csrfToken()});
});

router.post('/products/write', upload.single('thumbnail'), csrfProtection, (req, res) => {
  const product = new ProductsModel({
    name : req.body.name,
    price : req.body.price,
    thumbnail: req.file ? req.file.filename : '',
    description : req.body.description,
    username: req.user.username,
  });

  if (!product.validateSync()) {
    product.save(err => {
      res.redirect('/admin/products');
    });
  } else {
    res.send('error');
  }
});

router.get('/products/detail/:id', async (req, res) => {
  const id = req.params.id;
  const [product, comments] = await Promise.all([
    ProductsModel.findOne({id}),
    CommentsModel.find({ product_id : id }),
  ]);
  res.render('admin/productsDetail', { product, comments });
});

router.get('/products/edit/:id', csrfProtection, (req, res) => {
  const id = req.params.id;
  ProductsModel.findOne({id}, (err, product) => {
    res.render('admin/form', { product: product, csrfToken: req.csrfToken() });
  });
});

router.post('/products/edit/:id', upload.single('thumbnail'), csrfProtection, (req, res) => {
  const id = req.params.id;

  ProductsModel.findOne( {id : req.params.id}, (err, product) => {
    if (req.file && product.thumbnail) { //요청중에 파일이 존재 할시 이전이미지 지운다.
      // 동기 방식
      fs.unlinkSync(uploadDir + '/' + product.thumbnail);
    }

    //넣을 변수 값을 셋팅한다
    const query = {
      name : req.body.name,
      price : req.body.price,
      thumbnail: req.file ? req.file.filename : product.thumbnail,
      description : req.body.description,
    };

    const productm = new ProductsModel(query);
    if (!productm.validateSync()) {
      //update의 첫번째 인자는 조건, 두번째 인자는 바뀔 값들
      ProductsModel.update({id}, { $set: query }, (err) => {
        //수정후 본래보던 상세페이지로 이동
        res.redirect(`/admin/products/detail/${id}`);
      });
    } else {
      res.send('error');
    }
  });
});

router.get('/products/delete/:id', (req, res) => {
  const id = req.params.id;
  ProductsModel.remove({id}, (err) => {
    res.redirect('/admin/products');
  });
});

router.post('/products/ajax_comment/insert', (req, res) => {
  const comment = new CommentsModel({
    content : req.body.content,
    product_id : parseInt(req.body.product_id, 10),
  });
  comment.save((err, comment) => {
    res.json({
      id : comment.id,
      content : comment.content,
      message : "success"
    });
  });
});

router.post('/products/ajax_comment/delete', (req, res) => {
  CommentsModel.remove({ id : req.body.comment_id } , (err) => {
    res.json({ message : "success" });
  });
});

router.post('/products/ajax_summernote', upload.array('thumbnail', 10), (req, res) => {
  res.send(req.files.map(file => `/uploads/${file.filename}`));
});

router.get('/order', (req, res) => {
  CheckoutModel.find((err, orderList) => {
    res.render( 'admin/orderList' ,
      { orderList : orderList }
    );
  }).sort('-created_at');
});

router.get('/order/edit/:id', (req, res) => {
  CheckoutModel.findOne( { id : req.params.id } , (err, order) => {
    res.render( 'admin/orderForm' ,
      { order }
    );
  });
});

router.post('/order/edit/:id', (req, res) => {
  const query = {
    status : req.body.status,
    song_jang : req.body.song_jang
  };

  CheckoutModel.update({ id : req.params.id }, { $set : query }, (err) => {
    res.redirect('/admin/order');
  });
});

router.get('/statistics', async (req, res) => {

  const barData = [];
  const barCursor = CheckoutModel.aggregate([
    {$sort: {created_at: -1}},
    {$group: {
      _id: {
        year: {$year: '$created_at'},
        month: {$month: '$created_at'},
        day: {$dayOfMonth: '$created_at'},
      },
      count: {$sum: 1}
    }}
  ]).cursor({batchSize: 1000}).exec();

  await barCursor.eachAsync((doc) => {
    if (doc !== null) barData.push(doc);
  });

  const pieData = [];
  const pieCursor = CheckoutModel.aggregate([
    {$group: {
      _id: "$status",
      count: {$sum: 1}
    }}
  ]).cursor({batchSize: 1000}).exec();

  await pieCursor.eachAsync((doc) => {
    if (doc !== null) pieData.push(doc);
  });

  res.render('admin/statistics' , { barData : barData , pieData:pieData });
});



module.exports = router;