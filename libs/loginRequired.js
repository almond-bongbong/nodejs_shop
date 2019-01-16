module.exports = function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/accounts/login')
  } else {
    next();
  }
};
