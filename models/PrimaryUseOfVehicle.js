const mongoose = require("mongoose");
const primaryVehicleSchema = new mongoose.Schema({
  option : String,
},{ collection: 'PrimaryVehicleUseOptions'});
const primaryVehicleUseOptions = mongoose.model("PrimaryVehicleUseOptions", primaryVehicleSchema);
module.exports = primaryVehicleUseOptions;