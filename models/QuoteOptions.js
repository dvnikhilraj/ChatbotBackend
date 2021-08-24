const mongoose = require("mongoose");
const QuoteOptions = new mongoose.Schema({
  name : String,
},{ collection: 'QuoteOptions'});
const Quotes = mongoose.model("QuoteOptions", QuoteOptions);
module.exports = Quotes;