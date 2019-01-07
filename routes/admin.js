const express = require('express');
const router = express.Router();
const ProductsModel = require('../models/ProductsModel');
const CommentsModel = require('../models/CommentsModel');

router.get('/', (req, res) => {
  res.send('hello admin');
});

router.get('/products', (req, res) => {
  ProductsModel.find((err, products) => {
    res.render('admin/products', { products: products });
  });
});

router.get('/products/write', (req, res) => {
  res.render('admin/form', {product: {}});
});

router.post('/products/write', (req, res) => {
  const product = new ProductsModel({
    name : req.body.name,
    price : req.body.price,
    description : req.body.description,
  });

  if (!product.validateSync()) {
    product.save(err => {
      res.redirect('/admin/products');
    });
  }
});

router.get('/products/detail/:id', (req, res) => {
  const id = req.params.id;
  ProductsModel.findOne({id}, (err, product) => {
    CommentsModel.find({ product_id : id } , (err, comments) => {
      res.render('admin/productsDetail', { product, comments });
    });
  });
});

router.get('/products/edit/:id', (req, res) => {
  const id = req.params.id;
  ProductsModel.findOne({id}, (err, product) => {
    res.render('admin/form', { product: product });
  });
});

router.post('/products/edit/:id', (req, res) => {
  const id = req.params.id;

  //넣을 변수 값을 셋팅한다
  const query = {
    name : req.body.name,
    price : req.body.price,
    description : req.body.description,
  };

  const product = new ProductsModel(query);
  if (!product.validateSync()) {
    //update의 첫번째 인자는 조건, 두번째 인자는 바뀔 값들
    ProductsModel.update({id}, { $set: query }, (err) => {
      //수정후 본래보던 상세페이지로 이동
      res.redirect(`/admin/products/detail/${id}`);
    });
  }
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

module.exports = router;