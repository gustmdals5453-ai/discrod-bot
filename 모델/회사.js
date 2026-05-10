const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({

  ownerId: String,

  name: String,

  money: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Company", companySchema);
