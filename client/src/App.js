import React from "react";
import "./App.css";
const request = require("request");
const audioControl = require("./AudioControl.js");

// request(
//   "https://coronavirus-tracker-api.herokuapp.com/v2/locations?source=nyt&province=California&county=Orange",
//   { json: true },
//   (err, res, body) => {
//     if (err) {
//       return console.log(err);
//     }
//     console.log(body);
//   }
// );

var command = "how many deaths in Venezuela?";
fetch("http://localhost:5000/covidAPI?message={command}")
  .then((res) => res.json())
  .then((res) => this.setState({ apiResponse: res }));
console.log(state.apiResponse);

function App() {
  return <div>Hello World!</div>;
}

// class App extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { apiResponse: "" };
//     this.audioControl = new audioControl(this.state);
//   }

//   render() {
//     return <div>Hello World!</div>;
//   }
// }

export default App;
