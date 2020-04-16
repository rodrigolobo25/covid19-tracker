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
    this.state = { dialogresult: [], isLoading: true };
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    var command =
      "What are the latest stats for Alachua County and Orange County in Florida?";
    fetch(`http://localhost:5000/covidAPI?message=${command}`)
      .then((res) => res.json())
      .then((res) => this.setState({ dialogresult: res, isLoading: false }));
  }

  render() {
    var { dialogresult, isLoading } = this.state;

    if (isLoading) {
      return <div>Loading....</div>;
    } else {
      console.log(dialogresult);
      return (
        <div>
          <div>The response was: </div>
          <div>{dialogresult.location[0].country}</div>
        </div>
      );
    }
  }
}

export default App;
