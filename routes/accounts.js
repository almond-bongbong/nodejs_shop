const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const router = express.Router();
const UserModel = require('../models/UserModel');
const passwordHash = require('../libs/passwordHash');

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true,
}, (req, username, password, done) => {
  UserModel.findOne({ username: username, password: passwordHash(password) }, (err, user) => {
    if (user) {
      return done(null, user);
    } else {
      return done(null, false, { message: '아이디 또는 비밀번호 오류 입니다.' });
    }
  });
}));

passport.serializeUser((user, done) => {
  console.log('serializeUser');
  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log('deserializeUser');
  UserModel.findOne({ id: user.id }, (error, result) => {
    result.password = '';
    done(null, result);
  });
});

router.get('/', (req, res) => {
  res.send('accounts app!');
});

router.get('/user', (req, res) => {
  const { username } = req.query;
  UserModel.findOne({username}, (err, user) => {
    if (user) {
      res.json({
        id: user.id,
        username: user.username,
        displayname: user.displayname,
        created_at: user.created_at,
      });
    } else {
      res.json(null);
    }
  });
});

router.get('/join', (req, res) => {
  res.render('accounts/join');
});

router.post('/join', function(req, res){
  const { username, password, displayname } = req.body;
  const User = new UserModel({
    username : username,
    password : passwordHash(password),
    displayname : displayname
  });

  User.save((err) => {
    res.send('<script>alert("회원가입 성공");location.href="/accounts/login";</script>');
  });
});

router.get('/login', (req, res) => {
  res.render('accounts/login', { flashMessage: req.flash().error });
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/accounts/login',
  failureFlash: true
}), (req, res) => {
  res.send('<script>alert("로그인 성공");location.href="/";</script>');
});

router.get('/success', (req, res) => {
  res.send(req.user);
});

router.get('/logout', (req, res) => {
  req.logout(); // passport 제공 함수
  res.redirect('/accounts/login');
});

module.exports = router;