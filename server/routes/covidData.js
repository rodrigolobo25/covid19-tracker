const dialogflow = require("dialogflow");
const uuid = require("uuid");

const sessionClient = new dialogflow.SessionsClient();
const sessionPath = sessionClient.sessionPath(projectId, sessionId);
const projectId = "covid19-fxfuyx";
const sessionId = uuid.v4();
const languageCode = "en";

router.get("/", function (req, res, next) {
  var query = req.query.message;
  var dialogresult = executeQueries(projectId, sessionId, query, languageCode);
  console.log(dialogresult);
  res.json(dialogresult);
});

module.exports = router;

async function detectIntent(query, languageCode) {
  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  return responses[0];
}

async function executeQueries(query, languageCode) {
  let intentResponse;
  try {
    console.log(`Sending Query: ${query}`);
    intentResponse = await detectIntent(query, languageCode);
    console.log("Detected intent");
    console.log(
      `Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`
    );
  } catch (error) {
    console.log(error);
  }
}
