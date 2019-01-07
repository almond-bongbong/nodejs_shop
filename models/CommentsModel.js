const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { autoIncrement } = require('mongoose-plugin-autoinc');

const CommentsSchema = new Schema({
  content : String,
  product_id : Number,
  created_at : {
    type : Date,
    default : Date.now()
  },
});

CommentsSchema.virtual('getDate').get(function(){
  const date = new Date(this.created_at);
  return {
    year : date.getFullYear(),
    month : date.getMonth()+1,
    day : date.getDate()
  };
});

CommentsSchema.plugin(autoIncrement, {model: 'comments', field: 'id', startAt: 1});
module.exports = mongoose.model('comments', CommentsSchema);