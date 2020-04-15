var express = require("express");
const dialogflow = require("dialogflow");
const uuid = require("uuid");
var router = express.Router();

const sessionClient = new dialogflow.SessionsClient();
const projectId = "covid19-fxfuyx";
const sessionId = uuid.v4();
const languageCode = "en";
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

router.get("/", async function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  var query = req.query.message;
  var dialogresult = await executeQueries(query, languageCode);
  res.send(dialogresult);
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
    return intentResponse.queryResult;
  } catch (error) {
    console.log(error);
  }
}
