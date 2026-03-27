const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId:String,
  money:{type:Number,default:0},
  lastDaily:{type:Number,default:0},
  warns:{type:Number,default:0},
  warnList:{type:Array,default:[]}
});

module.exports = mongoose.model("User",schema);
