const express = require('express');
const router = express.Router();
const UserModel = require('../models/UserModel');

router.get('/', (req, res) => {
  UserModel.find((err, contacts) => {
    res.render('contacts/list',
      { contacts: contacts }
    );
  });
});

module.exports = router;