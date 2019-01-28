var express = require('express');
var router = express.Router();
var UserModel = require('../models/UserModel');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(new FacebookStrategy({
  clientID: '138872103698436',
  clientSecret: '94ebe7c2fefc7d9b4de16661a984780c',
  callbackURL: 'https://localhost:3000/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'photos', 'email'],
}, (accessToken, refreshToken, profile, done) => {
  console.log('access token : ', accessToken);
  console.log('refresh token : ', refreshToken);
  console.log(profile);

  UserModel.findOne({ username: 'fb_' + profile.id }, (err, user) => {
    if (!user) {
      const regData = {
        username: 'fb_' + profile.id,
        password: 'facebook_login',
        displayname: profile.displayname,
      };
      const User = new UserModel(regData);
      User.save((err) => {
        done(null, regData); // 세션 등록
      });
    } else {
      done(null, user);
    }
  });
}));

router.get('/facebook', passport.authenticate('facebook', { scope: 'email'}) );

router.get('/facebook/callback',
  passport.authenticate('facebook',
    {
      successRedirect: '/',
      failureRedirect: '/auth/facebook/fail'
    }
  )
);

router.get('/facebook/success', function(req,res){
  res.send(req.user);
});

router.get('/facebook/fail', function(req,res){
  res.send('facebook login fail');
});

module.exports = router;