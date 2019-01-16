const express = require('express');
const path = require('path');
const home = require('./routes/home');
const admin = require('./routes/admin');
const contacts = require('./routes/contacts');
const accounts = require('./routes/accounts');
const auth = require('./routes/auth');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const passport = require('passport');
const session = require('express-session');

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

// 미들웨어 세팅
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//업로드 path 추가, 정적 파일 제공
app.use('/uploads', express.static('uploads'));

app.use(session({
  secret: 'fastcampus',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 2000 * 60 * 60 //지속시간 2시간
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req, res, next) {
  app.locals.isLogin = req.isAuthenticated();
  next();
});

app.use('/', home);
app.use('/admin', admin);
app.use('/accounts', accounts);
app.use('/contacts', contacts);
app.use('/auth', auth);

app.listen(port, () => {
  console.log('Express listening on port', port);
});