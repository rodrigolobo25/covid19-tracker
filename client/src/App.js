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
  Button,
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
var change = "";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogresult: ["No"],
      isLoading: false,
      message: "Welcome to Coronavirus Data Tracker!",
      start: true,
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => this.loadData(), 500);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getStarted = () => this.setState({ start: false });

  async loadData() {
    if (!this.state.start) {
      const audioControl = require("./AudioControl.js");
      var command = audioControl.AudioControl();
      if (!this.state.start && change !== command) {
        this.setState((state) => ({
          isLoading: !state.isLoading,
        }));
        change = command;
        console.log(command);
        fetch(`http://localhost:5000/covidAPI?message=${command}`)
          .then((res) => res.json())
          .then((res) => {
            audioControl.speakMessage(res.message.value);
            this.setState({
              dialogresult: res.covidresult,
              isLoading: false,
              message: res.message.value,
            });
          });
      }
    }
  }

  render() {
    var { dialogresult, isLoading, message, start } = this.state;
    const colors = { Confirmed: "red", Recovered: "green", Deaths: "black" };

    if (start) {
      return (
        <Segment attached>
          <Header as="h3" align="center" style={{ margin: "40px" }}>
            Welcome to Coronavirus Data Tracker created by Rodrigo Lobo! This
            application shows real time data about the current Coronavirus
            crisis, feel free to talk to the agent. I hope you like it!
          </Header>
          <Button size="huge" positive onClick={this.getStarted}>
            Let's get started!
          </Button>
        </Segment>
      );
    } else if (isLoading) {
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
          <Header as="h2" align="center">
            {message}
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
