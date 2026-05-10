const mongoose = require("mongoose");

const UserStockSchema = new mongoose.Schema({

  userId: String,

  stockCode: String,

  amount: {
    type: Number,
    default: 0
  }

});

module.exports = mongoose.model("UserStock", UserStockSchema);
