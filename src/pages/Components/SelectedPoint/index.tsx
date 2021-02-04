import React, { Component, useState, useEffect } from "react";
// import Plot from "react-plotly.js";
import * as companies from "../../../data/urlMatcher.json";
import "react-datepicker/dist/react-datepicker.css";
// npm install react-datepicker --save
import { Container, Row, Col } from "react-bootstrap";
import { ComponentProps } from "react";
//npm install react-bootstrap bootstrap

export interface SelectedPointProps {
  company: string[];
  dates: string[];
}

type DailyExchange = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose?: number;
  volume: number;
};

type DailyDisplay = {
  name: string;
  daily: DailyExchange;
};

class SelectedPoint extends React.Component<{
  company: string[];
  dates: string[];
}> {
  private company: string[];
  private dates: string[];

  dailyValues: DailyExchange[] = [];
  cleanDate: string;
  plotGraphData: any[] = [];
  dataGraph: any[] = [];
  stockEvents: any[] = [];

  state = {
    loaded: false,
    valuesLoaded: [],
  };

  constructor(props: SelectedPointProps) {
    super(props);
    this.company = this.props.company;
    this.dates = this.props.dates;
    this.cleanDate = this.dates.length !== 0 ? this.dates[0].split(" ")[0] : "";
    console.log(this.company);
    console.log(this.dates);
    console.log(this.cleanDate);
  }
  // setting to props parameters

  async componentDidMount() {
    async function myFetch(toFetch: string) {
      const response = await fetch(toFetch);
      //   return Promise.resolve(response);
      return response;
    }

    let myFetches: any[] = [];
    let companiesFetched: string[] = [];

    this.company.forEach((id) => {
      if (id !== "") {
        const fetching = companies.companies.find((comp) => comp.id === id)
          ?.JsonUrl;
        console.log("we are fetching: " + fetching);

        const companyName = companies.companies.find((comp) => comp.id === id)
          ?.name;
        console.log("Company we are fetching: " + companyName);
        companiesFetched.push(String(companyName));
        console.log("fetching: " + fetching);
        myFetches.push(myFetch(String(fetching)));
      }
    });

    companiesFetched.reverse();
    Promise.all(myFetches)
      .then((files) => {
        files.forEach(async (file) => {
          let data = await file.json();
          this.stockEvents = data;
          console.log(this.stockEvents?.length);
          console.log(this.stockEvents);
          this.stockEvents.forEach((stocky) => {
            let tempString: string = JSON.stringify(stocky); //extract(stockEvents[i]);
            let obj = JSON.parse(tempString);
            if (obj.Date === this.cleanDate) {
              let dailyExchangeObj: DailyExchange = {
                date: obj.Date,
                high: obj.High,
                low: obj.Low,
                open: obj.Open,
                volume: obj.Volume,
                close: obj.Close,
              };
              this.dailyValues.push(dailyExchangeObj);
            }
          });
          this.populateGraphValue(
            this.dailyValues,
            String(companiesFetched.pop())
          );
        });
      })
      .catch((err) => {
        console.log("There was an error in fetching", err);
      });
  }

  populateGraphValue = (dailyValuesList: any[], graphTitle: string) => {
    dailyValuesList.forEach((daily) => {
      let tempObj: DailyDisplay = {
        name: graphTitle,
        daily: daily,
      };

      console.log(tempObj);
      this.dataGraph.push(tempObj);
      console.log("Number of data in my list " + this.dataGraph.length);
    });
    // dates = [];
    this.setState({ valuesLoaded: this.dataGraph });
  };

  displayStock = (dailyObj) => {
    console.log(dailyObj);
    return (
      <div>
        <h3>{dailyObj.name}</h3>
        <ul>
          <li>Date: {dailyObj.daily.date}</li>
          <li>Volume: {dailyObj.daily.volume}</li>
          <li>Open: {dailyObj.daily.open}</li>
          <li>Close: {dailyObj.daily.close}</li>
          <li>High: {dailyObj.daily.high}</li>
          <li>Low: {dailyObj.daily.low}</li>
        </ul>
      </div>
    );
  };

  DisplayAll = () => {
    if (this.dataGraph.length === this.company.length) {
      this.setState({ loaded: true });
    }
    return this.state.valuesLoaded.map((item) => {
      return <div key={item}> {this.displayStock(item)}</div>;
    });
  };

  public render() {
    return !this.state.loaded ? (
      <div style={{ alignItems: "center", margin: "12px" }}>
        <div>These are the selected values</div>
        <div>{this.DisplayAll()}</div>
      </div>
    ) : (
      <div>
        <h2>n/a</h2>
      </div>
    );
  }
}

export default SelectedPoint;
