var state;
function AudioControl(s) {
  state = s;
}

var recognition = new window.webkitSpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = true;
recognition.maxAlternatives = 1;
recognition.continuous = true;
recognition.start();

var speechRequest = {
  location: "",
  deaths: "",
  cases: "",
  recovered: "",
};

recognition.onresult = function (event) {
  var last = event.results.length - 1;
  if (event.results[last].isFinal) {
    var command = event.results[last][0].transcript;
  }
  console.log(state.apiResponse);
};
