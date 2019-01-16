const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { autoIncrement } = require('mongoose-plugin-autoinc');

const ProductsSchema = new Schema({
  name: {
    type: String,
    required: [true, '제목을 입력해주세요.']
  },
  price: Number,
  description: String,
  thumbnail : String, //이미지 파일명
  created_at: {
    type: Date,
    default: Date.now(),
  },
  username : String  //작성자추가
});

ProductsSchema.virtual('getDate').get(function(){
  const date = new Date(this.created_at);
  return {
    year : date.getFullYear(),
    month : date.getMonth()+1,
    day : date.getDate()
  };
});

ProductsSchema.plugin(autoIncrement, {model: 'products', field: 'id', startAt: 1});

module.exports = mongoose.model('products', ProductsSchema);