var webhook = require('../FulfillmentWebhook');
const express = require('express');
var routes = require('../routes');
const uuid = require('uuid');
const app = express();
const QuoteEnquiryDetails = require('../models/QuoteEnquiryDetails')
var databaseHelper = require('../databaseHelper');
let socketInstance;

exports.init = function(){
  const server = require('http').createServer(app);

  ////Initializing webhook for dialogflow fulfillment
  app.post('/webhook',express.json(),routes.dialogflowFulfillment);
  const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});
io.on('connection', socket => {
  socketInstance =socket;
  socket.on('sendMessageToServer', msg => {
    
    webhook.GetResponseFromDialogFlow(msg.text,msg.context).then(res => 
    {
    // console.log(res.context);
      for (index = 0; index < res.data.length; ++index) {
          socket.emit('responseFromServer', {
            text :res.data[index].text.text[0],
            context : res.context
          });
      }      
    });
  });  

  socket.on('saveCurrentInsurance', formData =>{
    ///SaveData
    var data = formData.data;
    var propertiesToSave = {
      CurrentInsuranceProvider : data.currentProvider,
      PolicyPeriod: data.policyPeriod,
      PolicyLimit:data.policyLimit,
      PolicyExpiryDate :data.policyExpiryDate,
    };
  databaseHelper.UpdatePropertiesInQuoteEnquiry(data.uniqueId,propertiesToSave)
  webhook.TriggerEvent("","Save_Current_Policy_FormDetails",formData.context).then(res=>
  // webhook.GetResponseFromDialogFlow("Save_Current_Policy_FormDetails",formData.context).then(res => 
  {
    console.log("saveCurrentInsurance");
    console.log(res);
    for (index = 0; index < res.data.length; ++index) {
        socket.emit('responseFromServer', {
          text :res.data[index].text.text[0],
          context : res.context
        });
    }      
  });
  });
  
  socket.on('saveAccidentDetails', formData =>{
    ///SaveData
    if(formData.data != null)
    {
      var data = formData.data;
      var propertiesToSave = {
        IncidentDate : data.incidentDate,
        FaultType: data.faultType,
        PrevClaimAmount:data.prevClaimAmount,
        Description :data.Description,
        AccidentType : data.accidentType
      };
      databaseHelper.UpdatePropertiesInQuoteEnquiry(data.uniqueId,propertiesToSave);
    }
  webhook.TriggerEvent("","Save_Accident_Details",formData.context).then(res=>
  // webhook.GetResponseFromDialogFlow("Save_Accident_Details",formData.context).then(res => 
  {
    for (index = 0; index < res.data.length; ++index) {
        socket.emit('responseFromServer', {
          text :res.data[index].text.text[0],
          context : res.context
        });
    }      
  });
  });

  socket.on('saveVehicleDetails',formData =>{
    var data = formData.data;
      var propertiesToSave = {
        MakeYear : data.makeYear,
        Model : data.model,
        CubicCapacity : data.cubicCapacity,
        FuelType : data.fuelType,
        InBuiltTheftSecurity : data.inBuiltTheftSecurity,
        SecurityDetails :data.securityDetails,
        CustomPartsCost :data.customPartsCost,
        RecoverSystemValue : data.recoverSystemValue,
        LicensedValue : data.licensedValue,
      };
      databaseHelper.UpdatePropertiesInQuoteEnquiry(data.uniqueId,propertiesToSave);
    ////SaveData;
    webhook.TriggerEvent("","Save_Vehicle_Form_Details",formData.context).then(res=>{
  // webhook.GetResponseFromDialogFlow("Save_Vehicle_Form_Details",formData.context).then(res=> {
    for (index = 0; index < res.data.length; ++index) {
      socket.emit('responseFromServer', {
        text :res.data[index].text.text[0],
        context : res.context
      });
  } 
  });
  
  });

  socket.on('savePrimaryUseForm', formData => {
    ///SaveData
    var data = formData.data;
    // const uniqueId = formData.uniqueId;
    var propertiesToSave = {
      DailyMilesTraveled : data.milesTravelled,
      AnnualMileage: data.annualMileage,
      BusinessType:data.businessType,
    };
    databaseHelper.UpdatePropertiesInQuoteEnquiry(data.uniqueId,propertiesToSave)
    webhook.TriggerEvent("","Initiate_Accident_Enquiry",formData.context).then(res=> {
      // console.log("REsponse");
      // console.log(res);
      for (index = 0; index < res.data.length; ++index) {
        socket.emit('responseFromServer', {
          text :res.data[index].text.text[0],
          context : res.context
        });
    } 
    });
  });
  socket.on('SaveContactDetails', formData => {
    ////SaveData;
    const uniqueId = uuid.v4();
    var data = formData.data;
    if(data !=null)
    {
      var enquiryDetails = new QuoteEnquiryDetails({
        UniqueId : uniqueId,
        Name : data.name,
        StreetAddress : data.streetAddress,
        City  :data.city,
        DOB  :data.dob,
        Email :data.email,
        PhoneNumber:data.phone,
        AnnualIncome:data.annualIncome,
        QuoteType : data.quoteType,
        ZIP : data.zip,
      });
      enquiryDetails.save(function (err, enquiry) {
        if (err) return console.error(err);
      });
    }
    var addContextParams = {
       uniqueId : uniqueId
    }
    webhook.TriggerEvent("","Save_Contact_data",formData.context,addContextParams,"Save_Enquiry_Details").then(res=> {
    // webhook.GetResponseFromDialogFlow("Savedata",formData.context,addContextParams,"Save_Enquiry_Details").then(res=> {
      for (index = 0; index < res.data.length; ++index) {
        socket.emit('responseFromServer', {
          text :res.data[index].text.text[0],
          context : res.context
        });
    } 
    });
  });
});
  server.listen(3002);
}

exports.GetSocketIoInstance = function(){
  return socketInstance;
}