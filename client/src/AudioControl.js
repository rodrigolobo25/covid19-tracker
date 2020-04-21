var state = "";
var voice;
var synthesis;
export function AudioControl() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = function () {
      var langRegex = /^en(-[a-z]{2})?$/i;
      synthesis = window.speechSynthesis;
      voice = synthesis
        .getVoices()
        .filter((voice) => langRegex.test(voice.lang))[1];
    };
  }
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
recognition.onspeechend = function () {
  recognition.abort();
  recognition.start();
};

export function speakMessage(message) {
  const utterance = new SpeechSynthesisUtterance();
  utterance.voice = voice;
  utterance.text = message;
  utterance.pitch = 7;
  utterance.rate = 1.2;
  utterance.volume = 0.6;
  synthesis.speak(utterance);
}
