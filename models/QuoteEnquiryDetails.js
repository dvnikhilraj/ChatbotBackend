const mongoose = require("mongoose");
const quoteEnquirySchema = new mongoose.Schema({
  UniqueId : String,  
  Name : String,
  StreetAddress : String,
  City : String,
  DOB : String,
  Email : String,
  PhoneNumber : Number,
  AnnualIncome : Number,
  HasVin : Boolean,
  VinNumber : Number,

  VehicleType : String, 
  ////NoVinDetails
  MakeYear : String,
  Model : String,
  CubicCapacity : String,
  FuelType : String,
   
  InBuiltTheftSecurity : String,  
  SecurityDetails : String,  
  CustomPartsCost : String,  
  RecoverSystemValue : String,  
  LicensedValue: String,  

  ////PrimaryUseDetails
  VehiclePrimaryUse : String,
  BusinessType : String,
  QuoteType : String,
  DailyMilesTraveled : String,
  AnnualMileage : String,
  ZIP : String,
  
  ////AccidentDetails
  HasMetWithAccident : Boolean,
  AccidentType : String,
  IncidentDate : String,
  FaultType : String,
  PrevClaimAmount : String,
  Description : String,
  
  ////HasExistingPolicy
  HasExistingPolicy : Boolean,
  CurrentInsuranceProvider : String,
  PolicyPeriod : String,
  PolicyLimit : String,
  PolicyExpiryDate : String,

  ////Start Current policy details
  StartCurrentPolicyDate : String,
  SelectedInsurancePolicy : String
},{ collection: 'QuoteEnquiryDetails'});
const QuoteDetails = mongoose.model("QuoteEnquiryDetails", quoteEnquirySchema);
module.exports = QuoteDetails;