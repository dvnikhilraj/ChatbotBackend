const mongoose = require("mongoose");
const insuranceSchema = new mongoose.Schema({
  name : String,
  policyId : Number,
  state : String,
  zip : Number,
  startDate : String,
  expiryDate : String,
  IDV : Number,
  status : Boolean,
  dueDate : String,
  insuranceType : String,
  renewalDuration : String,
},{ collection: 'CustomerDetails'});
const InsuranceDetails = mongoose.model("Insurance", insuranceSchema);
module.exports = InsuranceDetails;