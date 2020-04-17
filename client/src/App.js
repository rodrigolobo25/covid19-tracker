import React from "react";
import "./App.css";
import {
  Header,
  Container,
  Segment,
  StatisticGroup,
  Statistic,
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
//const audioControl = require("./AudioControl.js");

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dialogresult: ["No"], isLoading: false };
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    var command = "how many deaths in Venezuela and Colombia";
    fetch(`http://localhost:5000/covidAPI?message=${command}`)
      .then((res) => res.json())
      .then((res) => this.setState({ dialogresult: res, isLoading: false }));
  }

  render() {
    var { dialogresult, isLoading } = this.state;

    if (isLoading) {
      return <div>Loading....</div>;
    } else if (dialogresult[0] === "No") {
      return (
        <Container>
          <Header
            as="h1"
            size="huge"
            block
            attached="top"
            align="center"
            style={{ marginTop: "10px" }}
          >
            Coronavirus Data Tracker
          </Header>
          <Segment attached>
            <Header as="h4" align="center">
              Please provide either a country, US state, US county or simply ask
              for worldwide data
            </Header>
          </Segment>
        </Container>
      );
    } else {
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
            {dialogresult.map(({ location, data }) => {
              return (
                <Segment>
                  <Header as="h2">{location}</Header>
                  <Statistic.Group>
                    {data.map((value) => {
                      return (
                        <Statistic>
                          <Statistic.Value>
                            {value[Object.keys(value)[0]]}
                          </Statistic.Value>
                          <Statistic.Label>
                            {Object.keys(value)[0]}
                          </Statistic.Label>
                        </Statistic>
                      );
                    })}
                  </Statistic.Group>
                </Segment>
              );
            })}
          </Segment>
        </Container>
      );
    }
  }
}

export default App;
