const crypto = require('crypto');
const mysalt = 'fastcampus';

module.exports = function(password) {
  return crypto.createHash('sha512').update( password + mysalt ).digest('base64');
};