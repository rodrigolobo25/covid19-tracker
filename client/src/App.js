import React from "react";
import "./App.css";
import { Header, Container, Divider, Segment } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
//const audioControl = require("./AudioControl.js");

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dialogresult: [], isLoading: true };
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    var command =
      "What are the latest stats for Alachua County and Orange County in Florida";
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
        <Container>
          <Header
            size="huge"
            block
            attached="top"
            align="center"
            style={{ marginTop: "10px" }}
          >
            Coronavirus Data Tracker
          </Header>
          <Segment attached>
            <div>The response was: </div>
            <div>{dialogresult.location[0].state}</div>
          </Segment>
        </Container>
      );
    }
  }
}

export default App;
