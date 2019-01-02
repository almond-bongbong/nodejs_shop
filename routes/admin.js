const express = require('express');
const router = express.Router();
const ProductsModel = require('../models/ProductsModel');

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
  product.save(err => {
    if (err) {
      res.send(`
            <script type="text/javascript">
                alert('${err.message}');
                location.href='/admin/products/write';
            </script>
      `);
    } else {
      res.redirect('/admin/products');
    }
  });
});

router.get('/products/detail/:id', (req, res) => {
  const id = req.params.id;
  ProductsModel.findOne({id: id}, (err, product) => {
    res.render('admin/detail', { product: product });
  });
});

router.get('/products/edit/:id', (req, res) => {
  const id = req.params.id;
  ProductsModel.findOne({id: id}, (err, product) => {
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

  //update의 첫번째 인자는 조건, 두번째 인자는 바뀔 값들
  ProductsModel.update({ id : id }, { $set : query }, (err) => {
    //수정후 본래보던 상세페이지로 이동
    res.redirect(`/admin/products/detail/${id}`);
  });
});

module.exports = router;