const mongoose = require("mongoose");
const cancelPolicySchema = new mongoose.Schema({
  reason : String,
},{ collection: 'CancelPolicyOptions'});
const CancelPolicyOptions = mongoose.model("CancelPolicyOptions", cancelPolicySchema);
module.exports = CancelPolicyOptions;