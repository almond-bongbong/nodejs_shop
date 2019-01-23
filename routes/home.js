const express = require('express');
const router = express.Router();
const ProductsModel = require('../models/ProductsModel');

router.get('/', (req, res) => {
  ProductsModel.find( (err, products) => {
    res.render( 'home', { products });
  });
});

module.exports = router;