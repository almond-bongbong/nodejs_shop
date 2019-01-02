const express = require('express');
const router = express.Router();
const ContactsModel = require('../models/ContactsModel');

router.get('/', (req, res) => {
  ContactsModel.find((err, contacts) => {
    res.render('contacts/list',
      { contacts: contacts }
    );
  });
});

router.get('/write', (req, res) => {
  res.render('contacts/form');
});

router.post('/write', (req, res) => {
  const product = new ContactsModel({
    name : req.body.name,
    title : req.body.title,
    article : req.body.article,
  });
  product.save(err => {
    if (err) {
      res.send(`
            <script type="text/javascript">
                alert('${err.message}');
                location.href='/admin/contacts/write';
            </script>
      `);
    } else {
      res.redirect('/contacts');
    }
  });
});

router.get('/:id', (req, res) => {
  const id = req.params.id;

  ContactsModel.findOne({id: id}, (err, contact) => {
    res.render('contacts/detail',
      { contact: contact }
    );
  });
});

module.exports = router;