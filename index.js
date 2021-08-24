const dotenv = require('dotenv');
dotenv.config();
const socketConfig = require('./socketIo');
const mongoose = require("mongoose");
// const Quote = require("./models/QuoteEnquiryDetails");
mongoose.connect(
  process.env.DB_CONNECTION,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify : false
  }
);

socketConfig.init();

// var quote1 = new Quote({option : " Personal Injury Protection"});
// quote1.save(function (err, book) {
//   if (err) return console.error(err);
//   console.log(book.name + " saved to bookstore collection.");
// });

// var quote2 = new Quote({option : "Uninsured /Underinsured Motorist Protection"});
// quote2.save(function (err, book) {
//   if (err) return console.error(err);
//   console.log(book.name + " saved to bookstore collection.");
// });

// var quote3 = new Quote({option : "Choose personalized quote"});
// quote3.save(function (err, book) {
//   if (err) return console.error(err);
//   console.log(book.name + " saved to bookstore collection.");
// });

// Quote.deleteMany({}).then(function(){
//   console.log("Data deleted"); // Success
// }).catch(function(error){
//   console.log(error); // Failure
// });