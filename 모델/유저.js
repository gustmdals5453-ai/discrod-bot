const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId:String,

  money:{
    type:Number,
    default:0
  },

  lastDaily:{
    type:Number,
    default:0
  },

  warns:{
    type:Number,
    default:0
  },

  warnList:{
    type:Array,
    default:[]
  },

  // ================== 주식 ==================

  stocks:{
    type:Object,
    default:{}
  },

  // ================== 회사 ==================

  company:{
    type:String,
    default:null
  }

});

module.exports = mongoose.model("User",schema);
