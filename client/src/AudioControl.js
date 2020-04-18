var state = "";
export function AudioControl() {
  return state;
}

var recognition = new window.webkitSpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = true;
recognition.maxAlternatives = 1;
recognition.continuous = true;
recognition.start();

recognition.onresult = function (event) {
  var last = event.results.length - 1;
  if (event.results[last].isFinal) {
    state = event.results[last][0].transcript;
  }
};
