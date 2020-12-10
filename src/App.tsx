/*App.js*/
import React, { Component, useState } from "react";
import "./App.css";
//Import all needed Component for this tutorial
//npm install react-router-dom --save
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import GraphPage from "./pages/graphpage";
import HomePage from "./pages/HomePage";
import PageNotFound from "./pages/NotFoundPage";

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/home" component={HomePage} />
          <Route exact path="/visual/:company/:option" component={GraphPage} />
          <Route exact path="/404" component={PageNotFound} />

          <Redirect to="/404" />
        </Switch>
      </Router>
    );
  }
}

export default App;
