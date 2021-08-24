const Insurance = require("./models/InsuranceModel");
const socketInstance = require('./socketIo');
const CancelPolicyReasons = require("./models/CancelPolicyReasons");
const QuuoteOptions = require("./models/QuoteOptions");
const VehicleTypeOptions = require("./models/VehicleTypeOptions");
const VehiclePrimaryUse = require("./models/PrimaryUseOfVehicle");
const QuoteEnquiry = require("./models/QuoteEnquiryDetails");
var databaseHelper = require("./databaseHelper");
const InsuranceTypes = require('./models/InsuranceTypesModel');

exports.ValidateInsurance = async function(agent)
{
    var policyId = agent.parameters.Policy_Number;
    // console.log(policyId);
     console.log("agent");
     
    // var insuranceContext = agent.context.get('save_enquiry_details');
    // console.log("insuranceContext");
    // console.log(insuranceContext);
    // var uuniqueId = insuranceContext.parameters.uniqueId;
    // console.log("uuniqueId");
    // console.log(uuniqueId);
    return validateInsuranceId(policyId,agent);    
}

exports.ProvideInsuranceDetails = async function (agent)
{
    
    var insuranceContext = agent.context.get('check_policy_status-followup');
    var insuranceId = insuranceContext.parameters.Policy_Number;
    if(agent.parameters.otp_number == '98765')
    {
        agent.add(`Your OTP has been verified. Here are the insurance details`);
        setTimeout(() => {printInsuranceDetails(insuranceId)},1000);
    }   
    else
    {
        agent.add(`The otp you have entered is invalid. Please try again.`);
    }
}

exports.CancelPolicyOtpVerification = async function (agent)
{
    if(agent.parameters.Otp_Number == '98765')
    {
        agent.add(`Your OTP has been verified. Kindly let us know the reason for cancellation`);
        CancelPolicyReasons.find({}, function (err, rsns) {
        var reasons = rsns.map(x=>x.reason);
        setTimeout(() => {sendOptions(reasons)},1000);
        });
    }   
    else
    {
        agent.add(`The otp you have entered is invalid. Please try again.`);
    }
}

exports.RenewPolicyOtpVerification = async function (agent)
{
    if(agent.parameters.Otp_Number == '98765')
    {
        agent.add(`Your OTP has been verified.`);
        var insuranceContext = agent.context.get('renew_policy-followup');
        var insuranceId = insuranceContext.parameters.Policy_Number;
       await Insurance.findOne({policyId : insuranceId}, function (err, currentInsurance) {
            // console.log(currentInsurance);
            // console.log(insuranceId);
            if(!currentInsurance.status)
            {
                agent.add(`You cannot renew your policy since your insurance is inactive.`);
            }
            else
            {
                agent.add(`Kindly let us know the term duration of your renewal?`);              
            }
        });
    }   
    else
    {
        agent.add(`The otp you have entered is invalid. Please try again.`);
    }
}

exports.CancelPolicyConfirmation = async function (agent)
{
    var insuranceContext = agent.context.get('cancel_policy-followup');
    var insuranceId = insuranceContext.parameters.Policy_Number;
    if(agent.query.toLowerCase() == "yes")
    {
        agent.add("Thank you.Your policy is cancelled. We have provided the details of the policy that is cancelled")
        Insurance.findOneAndUpdate({policyId: insuranceId}, {$set:{status:false}}, (err, doc) => {
            if (err) {
                console.log("Something wrong when updating data!");
            }
            setTimeout(() => {printInsuranceDetails(insuranceId)},1000);
        });
    }
    else
    {
        agent.add("Thank you.Your policy is not cancelled. Kindly let me know if I can help you with something else.")
    }

}

exports.CancelPolicySpecificReason = async function (agent)
{
    agent.add("Sorry for the inconvenience caused. We will try to improve our services");
    CancelPolicy(agent);
}

exports.CancelPolicyReason = async function (agent)
{
    CancelPolicy(agent);
}

function CancelPolicy(agent)
{
    if(agent.query == "Dissatisfied with the current policy")
    {
        agent.add("Kindly let us know ,why you are not satisfied with the current policy");
    }
    else
    {
        agent.add("Are you sure you want to cancel the policy?");
        var options = ["Yes","No"];
        setTimeout(() => {sendOptions(options)},1000);
    }
}

function sendOptions(options)
{
    var socket = socketInstance.GetSocketIoInstance();
    socket.emit('displayOptions',options);
}

function sendText(text)
{
    var socket = socketInstance.GetSocketIoInstance();
     
    socket.emit('responseFromServer',{
        text : text,
        context : [],
    });
}

async function printInsuranceDetails(insuranceId)
{
    console.log("insuranceId");
    console.log(insuranceId);
    await Insurance.findOne({policyId : insuranceId}, function (err, currentInsurance) {
        console.log("currentInsurance");
    console.log(currentInsurance);
        if(currentInsurance)
        {
            var insuranceStatus = currentInsurance.status ? "Active" : "Inactive";
            var insuranceDetails = `Name : ${currentInsurance.name} <br/>
            Policy Id : ${currentInsurance.name}<br/>
            State : ${currentInsurance.state}<br/>
            Zip : ${currentInsurance.zip}<br/>
            Start Date : ${currentInsurance.startDate}<br/>
            Expiry Date : ${currentInsurance.expiryDate}<br/>
            IDV :  ${currentInsurance.IDV}<br/>
            Status :  ${insuranceStatus}<br/>
            Insurance Type :  ${currentInsurance.insuranceType}<br/>`;
            sendText(insuranceDetails);
        }
    });
}

async function validateInsuranceId(insuranceId,agent)
{
    await Insurance.findOne({policyId : insuranceId}, function(err,insurance) 
    {
        // console.log(insurance);
        if(insurance != null)
        {
           return agent.add("Thank you for providing the Insurane Id. We have sent an OTP to your registered mobile number. Please enter it here.")
        }
        else
        {
            return agent.add("The policy number you have entered is invalid. Please try again.");
        }
    });
}
exports.RenewPolicyDuration = async function (agent)
{
    var insuranceContext = agent.context.get('renew_policy-followup');
    var insuranceId = insuranceContext.parameters.Policy_Number;
    var timeDuration = `${agent.parameters.duration.amount}${agent.parameters.duration.unit}`;
    // console.log("timeDuration");
    // console.log(timeDuration.amount );
    // console.log(insuranceId);
    // string timeDuration
    await Insurance.findOneAndUpdate({policyId: insuranceId}, {$set:{renewalDuration:timeDuration}}, (err, doc) => {
        if (err) {
            console.log(err);
        }
        agent.add(`Are you sure you want to renew your policy?`);
        var options = ["Yes","No"];
        setTimeout(() => {sendOptions(options)},1000);
    });
}

exports.RenewPolicyConfirmation = async function (agent)
{
    var insuranceContext = agent.context.get('renew_policy-followup');
    var insuranceId = insuranceContext.parameters.Policy_Number;
    console.log(insuranceId);
    if(agent.query.toLowerCase() == "yes")
    {
        agent.add("Thank you.Your policy is renewed. We have provided the details of the policy that is cancelled")
        setTimeout(() => {printInsuranceDetails(insuranceId)},1000);
    }
    else
    {
        agent.add("Thank you.Your policy is not renewed. Kindly let me know if I can help you with something else.")
    }

}

exports.GetInsuranceQuote = async function (agent)
{
    agent.add("Kindly select a category for which you would like to receive a quote.");
    await QuuoteOptions.find({}, function (err, opts) {
        
        var options = opts.map(x=>x.name);
        setTimeout(() => {sendOptions(options)},1000);
        });

}

exports.GetContactDetails = async function (agent)
{
    agent.add("Kindly provide your contact details");
    var socket = socketInstance.GetSocketIoInstance();
    var quoteType = agent.context.get('quote_type');
    var zipContext = agent.context.get('get_insurance_quote_auto_zip-followup').parameters;
    console.log(zipContext.zipCode);
    setTimeout(() => {socket.emit('showContactForm',{
        quoteType   : quoteType.parameters.quoteType,
        zip : zipContext.zipCode,
    })},1000);
    
    // QuuoteOptions.find({}, function (err, opts) {
    //     var options = opts.map(x=>x.options);
    //     setTimeout(() => {sendOptions(options)},1000);
    //     });

}

exports.GetVinDetails = async function (agent)
{
    var insuranceContext = agent.context.get('save_enquiry_details');
    // console.log("insuranceContext");
    // console.log(insuranceContext);
    var uuniqueId = insuranceContext.parameters.uniqueId;
    // console.log("uuniqueId");
    // console.log(uuniqueId);
    agent.add("Thank you for providing your Details.Do you have a VIN number?");
    var options = ["Yes","No"];
    setTimeout(() => {sendOptions(options)},1000);
}

exports.GetVehicleTypeOptions = async function (agent)
{
    // console.log("VIN agent");
    // console.log(agent.parameters.Vin_Number);
    // console.log(agent.parameters.ModelYear);
    var idContext = agent.context.get('save_enquiry_details');
    // console.log("idContext");
    // console.log(idContext);
    var uniqueId = idContext.parameters.uniqueId;
    var propertiesToSave = {
        HasVin : true,
        VinNumber : agent.parameters.Vin_Number,
        Model : agent.parameters.ModelYear,
    }
    // await databaseHelper.UpdatePropertiesInQuoteEnquiry(uniqueId, propertiesToSave);
    agent.add("Please provide your vehicle type");
    await VehicleTypeOptions.find({}, function (err, vehicleType) {
        var options = vehicleType.map(x=>x.option);
        setTimeout(() => {sendOptions(options)},1000);
        });
}

exports.GetVehiclePrimaryUse = async function (agent)
{
    var idContext = agent.context.get('save_enquiry_details');
    // console.log("GetVehiclePrimaryUse");
    var uniqueId = idContext.parameters.uniqueId;
    var propertiesToSave = {
        VehicleType : agent.query,
    }
    // await databaseHelper.UpdatePropertiesInQuoteEnquiry(uniqueId, propertiesToSave);
    // console.log(idContext);
    agent.add("Please select the primary use of vehicle");
    await VehiclePrimaryUse.find({}, function (err, primaryUse) {
        var options = primaryUse.map(x=>x.option);
        setTimeout(() => {sendOptions(options)},1000);
    });
}

exports.SaveVehicleTypeLeisure = async function (agent)
{
    agent.add("Can you plaese provide the annual estimated mileage?");
    var idContext = agent.context.get('save_enquiry_details');
    // console.log("idContext");
    // console.log(idContext);
    var uniqueId = idContext.parameters.uniqueId;
    var propertiesToSave = {VehiclePrimaryUse:agent.query}
    await databaseHelper.UpdatePropertiesInQuoteEnquiry(uniqueId, propertiesToSave);
}

exports.SaveVehicleTypeCommuteFallback = async function (agent)
{
    // agent.add("Kindly provide an estimated daily miles travelled?");
    var idContext = agent.context.get('save_enquiry_details');
    // console.log("idContext");
    // console.log(idContext);
    var uniqueId = idContext.parameters.uniqueId;
    var propertiesToSave = {DailyMilesTraveled:agent.query}
    agent.add("Can you plaese provide the annual estimated mileage?");
    await databaseHelper.UpdatePropertiesInQuoteEnquiry(uniqueId, propertiesToSave);
}
exports.ShowPrimaryUseDetailsForm = async function (agent)
{
    agent.add("Please fill the following details");
    var idContext = agent.context.get('save_enquiry_details');
    // console.log("idContext");
    // console.log(idContext);
    var uniqueId = idContext.parameters.uniqueId;
    var propertiesToSave = {VehiclePrimaryUse:agent.query};
    // await databaseHelper.UpdatePropertiesInQuoteEnquiry(uniqueId, propertiesToSave);    
    var socket = socketInstance.GetSocketIoInstance();
    setTimeout(() => {socket.emit('showPrimaryUseForm',{
        primaryUseType : agent.query,
        uniqueId : uniqueId,
    })},1000);
}

exports.SaveVehicleTypeBusinessFallback = async function (agent)
{
    agent.add("Can you plaese provide the annual estimated mileage?");
    var idContext = agent.context.get('save_enquiry_details');
    // console.log("insuranceContext");
    // console.log(idContext);
    var uniqueId = idContext.parameters.uniqueId;
    var propertiesToSave = {BusinessType:agent.query}
    await databaseHelper.UpdatePropertiesInQuoteEnquiry(uniqueId, propertiesToSave);    
}

exports.SaveVehicleTypeBusiness = async function (agent)
{
    agent.add("Can you please provide the type of business?");
    var idContext = agent.context.get('save_enquiry_details');
    // console.log("insuranceContext");
    // console.log(idContext);
    var uniqueId = idContext.parameters.uniqueId;
    var propertiesToSave = {VehiclePrimaryUse:agent.query}
    await databaseHelper.UpdatePropertiesInQuoteEnquiry(uniqueId, propertiesToSave);
    
}

exports.AccidentDetails = async function (agent)
{
    var idContext = agent.context.get('save_enquiry_details');
    var uniqueId = idContext.parameters.uniqueId;
    var propertiesToUpdate = {
        HasMetWithAccident : true,
    }
    await databaseHelper.UpdatePropertiesInQuoteEnquiry(uniqueId,propertiesToUpdate);
    agent.add("Please select an option below");
    var options = ['Accident','Violation'];
    setTimeout(() => {sendOptions(options)},1000);
}

exports.NoPriorAccidents = async function (agent)
{
    var idContext = agent.context.get('save_enquiry_details');
    var uniqueId = idContext.parameters.uniqueId;
    var propertiesToUpdate = {
        HasMetWithAccident : false,
    }
    await databaseHelper.UpdatePropertiesInQuoteEnquiry(uniqueId,propertiesToUpdate);
    agent.add("Thats Good !");
    // console.log("agent");
    // console.log(agent);
    var socket = socketInstance.GetSocketIoInstance();
    setTimeout(() => {socket.emit('triggerCurrentPolicyEvent',uniqueId)},1000);
}

exports.ShowAccidentForm = async function (agent)
{
    var idContext = agent.context.get('save_enquiry_details');
    var uniqueId = idContext.parameters.uniqueId;
    agent.add("Kindly fill the following details");
    var socket = socketInstance.GetSocketIoInstance();
    setTimeout(() => {socket.emit('showAccidentForm',
    {
        IsAccidentForm:true,
        uniqueId:uniqueId,
    })},1000);
}
exports.ShowViolationForm = async function (agent)
{
    var idContext = agent.context.get('save_enquiry_details');
    var uniqueId = idContext.parameters.uniqueId;
    agent.add("Kindly fill the following details");
    var socket = socketInstance.GetSocketIoInstance();
    setTimeout(() => {socket.emit('showAccidentForm',{
        IsAccidentForm:false,
        uniqueId:uniqueId,
    })},1000);

}
exports.SaveAccidentDetails = async function (agent)
{
    console.log("Save_Accident_Details");
    // agent.add("Thank you for providing the details");
    agent.add("Are you currently covered by any policy?");
    var options = ["Yes","No"];
    setTimeout(() => {sendOptions(options)},1000);
}

exports.CurrentPolicyForm = async function (agent)
{
    var idContext = agent.context.get('save_enquiry_details');
    var uniqueId = idContext.parameters.uniqueId;
    var propertiesToSave = {
        HasExistingPolicy : true,
    }
    // await databaseHelper.UpdatePropertiesInQuoteEnquiry(uniqueId,propertiesToSave);
    agent.add("Kindly provide your current insurance details");
    var socket = socketInstance.GetSocketIoInstance();
    setTimeout(() => {socket.emit('showInsuranceProviderForm',uniqueId)},1000);
}

exports.NoCurrentPolicy = async function (agent)
{
    var idContext = agent.context.get('save_enquiry_details');
    var uniqueId = idContext.parameters.uniqueId;
    var propertiesToSave = {
        HasExistingPolicy : false,
    }
    await databaseHelper.UpdatePropertiesInQuoteEnquiry(uniqueId,propertiesToSave);
    agent.add("When was the last expiry date?");
    var options = ["< 90 Days","> 90 Days", "Never Insured"];
    setTimeout(() => {sendOptions(options)},1000);
}

exports.NextPlanStartingDetails = async function(agent)
{
    console.log("NextPlanStartingDetails");
    agent.add("When do you want the plan to start?");
    var options = ["Immediately", "Post expiration of insurance plan"];
    setTimeout(() => {sendOptions(options)},1000);
    if(agent.query)
    {
        var idContext = agent.context.get('save_enquiry_details');
        var uniqueId = idContext.parameters.uniqueId;
        var propertiesToSave = {
            PolicyExpiryDate : agent.query,
        }
        await databaseHelper.UpdatePropertiesInQuoteEnquiry(uniqueId,propertiesToSave);
    }
}

exports.ShowInsurancePlans = async function(agent)
{
    agent.add("Hey here are the avialable Insurane plans for your vehicle");
    await InsuranceTypes.find({}, function (err, opt) {
        var options = opt.map(x=>x.option);
        setTimeout(() => {sendOptions(options)},1000);
        });
    var idContext = agent.context.get('save_enquiry_details');
    var uniqueId = idContext.parameters.uniqueId;
    var propertiesToSave = {
        StartCurrentPolicyDate : agent.query,
    }
    await databaseHelper.UpdatePropertiesInQuoteEnquiry(uniqueId,propertiesToSave);
}

exports.ShowVehicleDetailsForm = async function(agent)
{
    agent.add("Kindly provide your vehicle details");
    var insuranceContext = agent.context.get('save_enquiry_details');
    console.log("Nooo insuranceContext");
    console.log(insuranceContext);
    var data = await GetQuoteDetails(insuranceContext.parameters.uniqueId);
    console.log("quoteType");
    console.log(data);
    console.log(data.QuoteType);
    
    var socket = socketInstance.GetSocketIoInstance();
    setTimeout(() => {socket.emit('showVehicleDetailsForm', {
            QuoteType : data.QuoteType,
            uniqueId : insuranceContext.parameters.uniqueId,
    })},1000);
}

exports.SaveVehicleDetailsForm = async function(agent)
{
    agent.add("Thank you for providing the details.");
    agent.add("Please provide your vehicle type");
    await VehicleTypeOptions.find({}, function (err, vehicleType) {
        var options = vehicleType.map(x=>x.option);
        setTimeout(() => {sendOptions(options)},1000);
        });
}

exports.zipCode = async function(agent)
{
    agent.add("Please enter your ZIP to continue");
    agent.context.set({ name: 'quote_type', lifespan: 2, parameters: { quoteType: agent.query }});
}

exports.SelectedInsurancePolicy = async function (agent)
{
    agent.add("We have sent a quote to your email. Kindly check your inbox");
    var idContext = agent.context.get('save_enquiry_details');
    var uniqueId = idContext.parameters.uniqueId;
    var propertiesToSave = {
        SelectedInsurancePolicy : agent.query,
    }
    await databaseHelper.UpdatePropertiesInQuoteEnquiry(uniqueId,propertiesToSave);

}
// async function UpdatePropertiesInQuoteEnquiry(uniqueId, propertiesToSave)
// {
//     await QuoteEnquiry.findOneAndUpdate({UniqueId: uniqueId}, {$set:propertiesToSave}, (err, doc) => {
//         if (err) {
//             console.log(err);
//         }
//     });
// }

async function GetQuoteDetails(uniqueId)
{
    console.log("uniqueId");
    console.log(uniqueId);
    console.log(uniqueId.toString());
    return await QuoteEnquiry.findOne({UniqueId : uniqueId.toString()}).exec();
//    await QuoteEnquiry.findOne({UniqueId : uniqueId.toString()}, function (err, currentEnquiry) {
//         if (err) {
//             console.log(err);
//         }
//         console.log("currentEnquiry");
//     console.log(currentEnquiry);
//         return currentEnquiry;
//     });
}