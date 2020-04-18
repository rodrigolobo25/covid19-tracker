import React from "react";
import "./App.css";
import {
  Header,
  Dimmer,
  Loader,
  Segment,
  Statistic,
  Icon,
  Image,
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

const audioControl = require("./AudioControl.js");
var change = "";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dialogresult: ["No"], isLoading: false };
  }

  componentDidMount() {
    this.interval = setInterval(() => this.loadData(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  async loadData() {
    var command = audioControl.AudioControl();
    console.log(command);
    if (change !== command) {
      this.setState((state) => ({
        isLoading: !state.isLoading,
      }));
      change = command;
      fetch(`http://localhost:5000/covidAPI?message=${command}`)
        .then((res) => res.json())
        .then((res) => this.setState({ dialogresult: res, isLoading: false }));
    }
  }

  render() {
    var { dialogresult, isLoading } = this.state;
    const colors = { Confirmed: "red", Recovered: "green", Deaths: "black" };

    if (isLoading) {
      return (
        <Segment>
          <Dimmer active inverted>
            <Loader size="massive">Loading</Loader>
          </Dimmer>

          <Image src="/short-paragraph.png" />
          <Image src="/short-paragraph.png" />
          <Image src="/short-paragraph.png" />
        </Segment>
      );
    } else if (dialogresult[0] === "No") {
      return (
        <Segment attached>
          <Header as="h4" align="center">
            Please provide either a country, US state, US county or simply ask
            for worldwide data
          </Header>
        </Segment>
      );
    } else {
      return (
        <Segment attached>
          {dialogresult.map(({ location, data }, i) => {
            if (data.length !== 0) {
              return (
                <Segment key={i} aligned="center">
                  <Header floated="left" icon as="h2">
                    <Icon name="map marker alternate" />
                    <Header.Content>{location}</Header.Content>
                  </Header>
                  <Statistic.Group widths="three">
                    {data.map((value, x) => {
                      return (
                        <Statistic
                          style={{ marginBottom: "40px", marginTop: "15px" }}
                          key={x}
                          color={colors[Object.keys(value)[0]]}
                        >
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
            }
          })}
        </Segment>
      );
    }
  }
}

export default App;
