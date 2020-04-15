const dialogflow = require("dialogflow");
const express = require("express");
const uuid = require("uuid");


const sessionClient = new dialogflow.SessionsClient();
const projectId = "maps-qqastc";
const sessionId = uuid.v4();
const languageCode = "en";
var query = "";

async function detectIntent(projectId, sessionId, query, languageCode) {
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

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

async function executeQueries(projectId, sessionId, query, languageCode) {
  // Keeping the context across queries let's us simulate an ongoing conversation with the bot
  let intentResponse;
  try {
    console.log(`Sending Query: ${query}`);
    intentResponse = await detectIntent(
      projectId,
      sessionId,
      query,
      languageCode
    );
    console.log("Detected intent");
    console.log(
      `Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`
    );
  } catch (error) {
    console.log(error);
  }
}
executeQueries(
  projectId,
  sessionId,
  "How many have died in Colombia?",
  languageCode
);
