const express = require('express');
const router = express.Router();
const ProductsModel = require('../models/ProductsModel');
const CommentsModel = require('../models/CommentsModel');

router.get('/:id' , async (req, res) => {
  const id = req.params.id;
  const [product, comments] = await Promise.all([
    ProductsModel.findOne({id}),
    CommentsModel.find({ product_id : id }),
  ]);
  res.render('products/detail', { product , comments });
});

module.exports = router;