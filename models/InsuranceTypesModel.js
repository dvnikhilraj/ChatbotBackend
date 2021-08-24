const mongoose = require("mongoose");
const InsuranceTypesSchema = new mongoose.Schema({
  option : String,
},{ collection: 'InsuranceTypes'});
const InsuranceTypeOptions = mongoose.model("InsuranceTypes", InsuranceTypesSchema);
module.exports = InsuranceTypeOptions;