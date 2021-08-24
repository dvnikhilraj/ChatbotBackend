var IntentNames = require('../constants')
var handleIntents = require('../handleIntents');
const {WebhookClient} = require('dialogflow-fulfillment');

module.exports.dialogflowFulfillment = function(req,res){
    const agent = new WebhookClient({ request : req, response : res });
    let intentMap = new Map();
    intentMap.set(IntentNames.CancelPolicy, handleIntents.ValidateInsurance );
    intentMap.set("Cancel_Policy_valid", handleIntents.CancelPolicyOtpVerification );
    intentMap.set("Cancel_Policy_reason", handleIntents.CancelPolicyReason );
    intentMap.set("Cancel_Policy_specificreason", handleIntents.CancelPolicyReason );
    intentMap.set("Cancel_Policy_Confirmation", handleIntents.CancelPolicyConfirmation );
    intentMap.set("Cancel_Policy_specificreason_FollowUp", handleIntents.CancelPolicySpecificReason );
    intentMap.set("Check_Policy_Status", handleIntents.ValidateInsurance );
    intentMap.set("Check_Policy_Status_Valid", handleIntents.ProvideInsuranceDetails );
    intentMap.set("Renew_Policy", handleIntents.ValidateInsurance );
    intentMap.set("Renew_Policy_Otp_Verification", handleIntents.RenewPolicyOtpVerification );
    intentMap.set("Renew_Policy_Duration", handleIntents.RenewPolicyDuration );
    intentMap.set("Renew_Policy_Duration_Confirmation", handleIntents.RenewPolicyConfirmation );
    intentMap.set("Get_Insurance_Quote", handleIntents.GetInsuranceQuote );
    intentMap.set("Get_Insurance_Quote_Auto_Zip", handleIntents.GetContactDetails );
    intentMap.set("Insurance_Quote_SaveData", handleIntents.GetVinDetails );
    intentMap.set("Quote_VIN_Year", handleIntents.GetVehicleTypeOptions );
    intentMap.set("Quote_VIN_VehicleType", handleIntents.GetVehiclePrimaryUse );
    // intentMap.set("Quote_VIN_Business", handleIntents.SaveVehicleTypeBusiness );
    // intentMap.set("Quote_VIN_Leisure", handleIntents.SaveVehicleTypeLeisure );
    // intentMap.set("Quote_VIN_Business_fallback1", handleIntents.SaveVehicleTypeBusinessFallback );
    intentMap.set("Quote_Get_Primary_Use_Details", handleIntents.ShowPrimaryUseDetailsForm );
    
    // intentMap.set("Quote_VIN_Commute", handleIntents.SaveVehicleTypeCommute );
    // intentMap.set("Quote_VIN_Commute_fallback", handleIntents.SaveVehicleTypeCommuteFallback );

    intentMap.set("Accident_Enquiry_yes", handleIntents.AccidentDetails );
    intentMap.set("Accident_Enquiry_no", handleIntents.NoPriorAccidents );
    
    intentMap.set("Accident_Enquiry_yes_Accident", handleIntents.ShowAccidentForm );
    intentMap.set("Accident_Enquiry_yes_Violation", handleIntents.ShowViolationForm );
    intentMap.set("Save_Accident_Details", handleIntents.SaveAccidentDetails );
    
    intentMap.set("Save_Accident_Details_yes", handleIntents.CurrentPolicyForm );
    intentMap.set("Save_Accident_Details_no", handleIntents.NoCurrentPolicy );
    intentMap.set("NewInsurancePlanDetails", handleIntents.NextPlanStartingDetails );
    intentMap.set("No_Existing_Insurance", handleIntents.NextPlanStartingDetails );
    
    intentMap.set("NewInsurancePlanDetails_details", handleIntents.ShowInsurancePlans );
    intentMap.set("NewInsurancePlanDetails_Specific", handleIntents.SelectedInsurancePolicy );
    
    intentMap.set("Get_Insurance_Quote_Auto", handleIntents.zipCode );
    
    intentMap.set("Quote_No_VIN_NUMBER", handleIntents.ShowVehicleDetailsForm );
     intentMap.set("Quote_No_VIN_NUMBER_Save", handleIntents.SaveVehicleDetailsForm );
    agent.handleRequest(intentMap);
}
////agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
