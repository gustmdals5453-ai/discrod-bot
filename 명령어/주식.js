const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  name: String,
  code: String,

  price: {
    type: Number,
    default: 1000
  },

  change: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Stock", stockSchema);
