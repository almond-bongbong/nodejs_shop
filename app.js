const express = require('express');
const path = require('path');
const admin = require('./routes/admin');
const contacts = require('./routes/contacts');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const logger = require('morgan');
const bodyParser = require('body-parser');

const db = mongoose.connection;

db.on('error', console.error);
db.once('open', () => {
  console.log('mongodb connect');
});

mongoose.connect('mongodb://127.0.0.1:27017/fastcampus', { useMongoClient: true });

const app = express();
const port = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('first app');
});

app.use('/contacts', contacts);
app.use('/admin', admin);

app.listen(port, () => {
  console.log('Express listening on port', port);
});