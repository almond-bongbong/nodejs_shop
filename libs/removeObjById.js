module.exports = function(){
  Array.prototype.removeObjById = function (search) {
    return this.filter(user => user.id !== search);
  };
};