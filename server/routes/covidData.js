var express = require("express");
const dialogflow = require("dialogflow");
const uuid = require("uuid");
var router = express.Router();

const sessionClient = new dialogflow.SessionsClient();
const projectId = "covid19-fxfuyx";
const sessionId = uuid.v4();
const languageCode = "en";
const sessionPath = sessionClient.sessionPath(projectId, sessionId);
var dialogresult = {
  intent: false,
  world: false,
  death: false,
  recovery: false,
  cases: false,
  location: [],
};

router.get("/", async function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  var query = req.query.message;
  var temp = await executeQueries(query, languageCode);

  //populating the dialogresult
  if (temp.intent.displayName == "0 - getData") {
    dialogresult.intent = true;
  }
  var valuesTemp = temp.parameters.fields.data.listValue.values;
  var valuesLength = valuesTemp.length;
  for (var i = 0; i < valuesLength; i++) {
    if (valuesTemp[i].stringValue == "cases") {
      dialogresult.cases = true;
    } else if (valuesTemp[i].stringValue == "recover") {
      dialogresult.recovery = true;
    } else if (valuesTemp[i].stringValue == "death") {
      dialogresult.death = true;
    }
  }
  if (temp.parameters.fields.world.stringValue != "") {
    dialogresult.world = true;
  }
  valuesTemp = temp.parameters.fields.location.listValue.values;
  var countyCheck = false;
  var diff = 0;
  valuesLength = valuesTemp.length;
  var tempArray = new Array(valuesLength)
    .fill(null)
    .map(() => ({ county: "", country: "", state: "" }));
  for (var i = 0; i < valuesLength; i++) {
    if (valuesTemp[i].structValue.fields["subadmin-area"].stringValue != "") {
      tempArray[i - diff].county =
        valuesTemp[i].structValue.fields["subadmin-area"].stringValue;
      if (valuesTemp[i].structValue.fields["admin-area"].stringValue != "") {
        tempArray[i - diff].state =
          valuesTemp[i].structValue.fields["admin-area"].stringValue;
      } else {
        countyCheck = true;
      }
    } else if (
      valuesTemp[i].structValue.fields["admin-area"].stringValue != ""
    ) {
      if (!countyCheck) {
        tempArray[i - diff].state =
          valuesTemp[i].structValue.fields["admin-area"].stringValue;
      } else {
        var x = i - 1;
        while (
          x >= 0 &&
          valuesTemp[x].structValue.fields["subadmin-area"].stringValue != ""
        ) {
          if (
            valuesTemp[x].structValue.fields["admin-area"].stringValue == ""
          ) {
            tempArray[x - diff].state =
              valuesTemp[i].structValue.fields["admin-area"].stringValue;
            x--;
          } else {
            break;
          }
        }
        countyCheck = false;
        tempArray.pop();
        diff++;
      }
    } else if (valuesTemp[i].structValue.fields.country.stringValue != "") {
      tempArray[i].country =
        valuesTemp[i].structValue.fields.country.stringValue;
    }
  }
  dialogresult.location = tempArray;

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
