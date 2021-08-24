const dialogflow = require('@google-cloud/dialogflow');
const { struct } = require('pb-util'); 
const contextsClient = new dialogflow.ContextsClient();
const uuid = require('uuid');
const sessionId = uuid.v4();

exports.TriggerEvent = async function (query,eventName, context = null, addContextParams = null , contextName = null)
{
  
  return executeQueries(process.env.GOOGLE_PROJECTID, sessionId, query, "en", context, eventName, addContextParams, contextName);

}

exports.GetResponseFromDialogFlow = async function (query, context = null, addContextParams = null , contextName = null)
{
  return executeQueries(process.env.GOOGLE_PROJECTID, sessionId, query, "en", context,null,addContextParams, contextName);
}

async function detectIntent(
  projectId,
  sessionId,
  query,
  contexts,
  languageCode,
  eventName
) {
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );
  var currentRequest;
  if(eventName == null)
  {
   
  currentRequest = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };
}
else
{
  currentRequest = {
    session: sessionPath,
    queryInput: {
      event: {
        name: eventName,
        languageCode: 'en-US',
      },
    },
  };
}

  if (contexts && contexts.length > 0) {
    currentRequest.queryParams = {
      contexts: contexts,
    };
  }
  // console.log("CurrentRequest");
  // console.log(currentRequest);
  const responses = await sessionClient.detectIntent(currentRequest);
  // console.log("responses");
  // console.log(responses);
  return responses[0];
}

async function executeQueries(projectId, sessionId, query, languageCode, context, eventName ,addContextParams,contextName ) {
  let intentResponse;
  try {
      if(addContextParams != null && contextName != null)
      {
        const newContext = await createContext(sessionId, contextName, addContextParams , 15);
        if(context != null) 
        {
          context = [...context, newContext];
        }
        else
        {
          context = newContext;
        }
      }
      intentResponse = await detectIntent(
        projectId,
        sessionId,
        query,
        context,
        languageCode,
        eventName
      );
      context = intentResponse.queryResult.outputContexts;
      // console.log(context);
      var res =  intentResponse.queryResult.fulfillmentMessages.filter(x=>x.platform == 'PLATFORM_UNSPECIFIED');
      return {
        data : res,
        context : context
      };
    } catch (error) {
      console.log(error);
  }
}


async function createContext(sessionId, contextId, parameters, lifespanCount = 5) {
  const sessionPath = contextsClient.projectAgentSessionPath(process.env.GOOGLE_PROJECTID, sessionId);
  const contextPath = contextsClient.projectAgentSessionContextPath(
      process.env.GOOGLE_PROJECTID,
      sessionId,
      contextId
  );
  const request = {
      parent: sessionPath,
      context: {
          name: contextPath,
          parameters: struct.encode(parameters),
          lifespanCount
      }
  };

  const [context] = await contextsClient.createContext(request);

  return context;
}
