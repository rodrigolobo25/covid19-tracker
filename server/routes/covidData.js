var express = require("express");
const dialogflow = require("dialogflow");
const uuid = require("uuid");
var router = express.Router();
const request = require("request");

const sessionClient = new dialogflow.SessionsClient();
const projectId = "covid19-fxfuyx";
const sessionId = uuid.v4();
const languageCode = "en";
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

router.get("/", async function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  var dialogresult = {
    intent: false,
    world: false,
    death: false,
    recovery: false,
    cases: false,
    location: [],
  };
  var query = req.query.message + "?";
  var temp = await executeQueries(query, languageCode);

  //populating the dialogresult
  if (temp.fulfillmentText != "No") {
    dialogresult.intent = true;
  }
  if (dialogresult.intent) {
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
    var countryTemp = temp.parameters.fields.country.listValue.values;
    valuesLength = valuesTemp.length;
    var countryLength = countryTemp.length;
    var tempArray = new Array(valuesLength + countryLength)
      .fill(null)
      .map(() => ({ county: "", country: "", state: "" }));
    var countyCheck = false;
    var diff = 0;
    for (var i = 0; i < valuesLength; i++) {
      if (valuesTemp[i].structValue.fields["subadmin-area"].stringValue != "") {
        if (
          valuesTemp[i].structValue.fields.country.stringValue != "" &&
          valuesTemp[i].structValue.fields.country.stringValue !=
            "United States"
        ) {
          tempArray[i - diff].country =
            valuesTemp[i].structValue.fields.country.stringValue;
          continue;
        }
        tempArray[i - diff].county =
          valuesTemp[i].structValue.fields["subadmin-area"].stringValue;
        if (tempArray[i - diff].county == "Manhattan") {
          tempArray[i - diff].county = "New York City";
        }
        if (valuesTemp[i].structValue.fields["admin-area"].stringValue != "") {
          tempArray[i - diff].state =
            valuesTemp[i].structValue.fields["admin-area"].stringValue;
        } else {
          countyCheck = true;
        }
      } else if (valuesTemp[i].structValue.fields.city.stringValue != "") {
        tempArray[i - diff].county =
          valuesTemp[i].structValue.fields.city.stringValue;
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
        tempArray[i - diff].country =
          valuesTemp[i].structValue.fields.country.stringValue;
        if (tempArray[i - diff].country == "Puerto Rico") {
          tempArray[i].state = "Puerto Rico";
        }
      }
    }
    var offset = 0;
    countryTemp.forEach(function (country) {
      tempArray[valuesLength - diff + offset].country = country.stringValue;
      offset++;
    });
    dialogresult.location = tempArray;
  }
  var covidresult = [];
  var search = true;

  if (!dialogresult.intent) {
    res.send(["No"]);
  } else {
    var { covidresult, search } = await covidAPI(dialogresult);
    if (search.value) {
      res.send(covidresult);
    } else {
      res.send(["No"]);
    }
  }
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
    console.log(
      `Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`
    );
    return intentResponse.queryResult;
  } catch (error) {
    console.log(error);
  }
}

function getData(body, covidresult, dialogresult, index, search) {
  if (body.detail != null) {
    console.log("Covid API did not find request");
  } else {
    search.value = true;
    if (dialogresult.cases) {
      covidresult[index].data.push({ Confirmed: body.latest.confirmed });
    }
    if (dialogresult.recovery) {
      covidresult[index].data.push({ Recovered: body.latest.recovered });
    }
    if (dialogresult.death) {
      covidresult[index].data.push({ Deaths: body.latest.deaths });
    }
    if (!dialogresult.death && !dialogresult.cases && !dialogresult.recovery) {
      covidresult[index].data.push({ Confirmed: body.latest.confirmed });
      covidresult[index].data.push({ Recovered: body.latest.recovered });
      covidresult[index].data.push({ Deaths: body.latest.deaths });
    }
  }
}

function makeRequest(
  nyt,
  country,
  county,
  state,
  covidresult,
  dialogresult,
  index,
  resolve,
  search
) {
  if (nyt == "" && country == "" && county == "" && state == "") {
    request(
      "https://coronavirus-tracker-api.ruizlab.org/v2/latest",
      { json: true },
      function (err, res, body) {
        if (err) {
          return console.log(err);
        } else {
          getData(body, covidresult, dialogresult, index, search);
          resolve(body);
        }
      }
    );
  } else {
    request(
      "https://coronavirus-tracker-api.ruizlab.org/v2/locations?" +
        nyt +
        country +
        county +
        state,
      { json: true },
      function (err, res, body) {
        if (err) {
          return console.log(err);
        } else {
          getData(body, covidresult, dialogresult, index, search);
          resolve(body);
        }
      }
    );
  }
}

async function covidAPI(dialogresult) {
  var search = { value: false };
  var promises = [];
  if (dialogresult.world) {
    var covidresult = new Array(dialogresult.location.length + 1)
      .fill(null)
      .map(() => ({ location: "", data: [] }));
    covidresult[dialogresult.location.length].location = "World";
    promises.push(
      new Promise((resolve, reject) =>
        makeRequest(
          "",
          "",
          "",
          "",
          covidresult,
          dialogresult,
          dialogresult.location.length,
          resolve,
          search
        )
      )
    );
  } else {
    var covidresult = new Array(dialogresult.location.length)
      .fill(null)
      .map(() => ({ location: "", data: [] }));
  }
  var country = "";
  var state = "";
  var county = "";
  var nyt = "";
  var index = 0;
  for (var i = 0; i < dialogresult.location.length; i++) {
    if (dialogresult.location[i].county != "") {
      if (dialogresult.location[i].state != "") {
        covidresult[i].location =
          dialogresult.location[i].county +
          ", " +
          dialogresult.location[i].state;
        state = "&province=" + dialogresult.location[i].state;
      } else {
        covidresult[i].location = dialogresult.location[i].county;
      }
      county =
        "&county=" + dialogresult.location[i].county.replace(" County", "");
      nyt = "&source=nyt";
    } else if (dialogresult.location[i].state != "") {
      covidresult[i].location = dialogresult.location[i].state;
      state = "&province=" + dialogresult.location[i].state;
      nyt = "&source=nyt";
    } else if (dialogresult.location[i].country != "") {
      covidresult[i].location = dialogresult.location[i].country;
      country = "&country=" + dialogresult.location[i].country;
    }
    console.log(
      "https://coronavirus-tracker-api.ruizlab.org/v2/locations?" +
        nyt +
        country +
        county +
        state
    );
    promises.push(
      new Promise((resolve, reject) =>
        makeRequest(
          nyt,
          country,
          county,
          state,
          covidresult,
          dialogresult,
          index,
          resolve,
          search
        )
      )
    );
    index++;
  }
  const array = await Promise.all(promises);
  return { covidresult, search };
}
