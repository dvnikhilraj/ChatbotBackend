const mongoose = require("mongoose");
const vehileTypeOptionsSchema = new mongoose.Schema({
  option : String,
},{ collection: 'VehicleTypeOptions'});
const VehicleTypeOptions = mongoose.model("VehicleTypeOptions", vehileTypeOptionsSchema);
module.exports = VehicleTypeOptions;