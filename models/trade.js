const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema({
  pair: String,
  tradeDate: Date,
  result: String,
  pnl: Number,
  tradeurl: String,
  trend: String,
  userId: mongoose.Schema.Types.ObjectId
});
module.exports = mongoose.model("Trade", tradeSchema);