import React from "react";
import "./App.css";
//const request = require("request");
//const audioControl = require("./AudioControl.js");

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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dialogresult: [], isLoading: false };
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    var command = "how many people have died in Venezuela?";
    fetch(`http://localhost:5000/covidAPI?message=${command}`)
      .then((res) => res.json())
      .then((res) => this.setState({ dialogresult: res, isLoading: false }));
  }

  render() {
    var { dialogresult, isLoading } = this.state;

    if (isLoading) {
      return <div>Loading....</div>;
    }

    return (
      <div>
        <div>The response was: </div>
        <div>{dialogresult}</div>
      </div>
    );
  }
}

export default App;
