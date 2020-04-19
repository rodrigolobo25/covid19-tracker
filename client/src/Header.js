import React from "react";
import "./App.css";
import { Header } from "semantic-ui-react";

function Head() {
  return (
    <Header
      as="h1"
      block
      attached="top"
      align="center"
      style={{ marginTop: "10px" }}
    >
      Coronavirus Data Tracker
    </Header>
  );
}

export default Head;
