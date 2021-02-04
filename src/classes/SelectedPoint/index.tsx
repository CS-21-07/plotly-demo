import React, { Component, useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
// import Plot from "react-plotly.js";
import * as companies from "../../data/urlMatcher.json";
import "react-datepicker/dist/react-datepicker.css";
// npm install react-datepicker --save
import { Container, Row, Col } from "react-bootstrap";
import { ComponentProps } from "react";
//npm install react-bootstrap bootstrap

export interface SelectedPointProps
  extends RouteComponentProps<{ company: string; dates: string }> {
  // Other props that belong to component it self not Router
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

class SelectedPoint extends React.Component<SelectedPointProps> {
  private company: string;
  private dates: string;

  companyList: string[];

  dailyValues: DailyExchange;
  cleanDate: string;
  plotGraphData: any[] = [];
  dataGraph: any[] = [];
  stockEvents: any[] = [];

  state = {
    loaded: false,
  };

  constructor(props: SelectedPointProps) {
    super(props);
    this.company = this.props.match.params.company;
    this.companyList = this.company.split("+").filter((elm) => elm !== "");
    this.dates = this.props.match.params.dates;
    this.dailyValues = {
      date: "No data - Market Close",
      high: 0,
      low: 0,
      open: 0,
      volume: 0,
      close: 0,
    };
    console.log(this.company);
    console.log(this.dates);
    console.log(this.companyList);
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

    this.companyList.forEach((id) => {
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
            if (obj.Date === this.dates) {
              let dailyExchangeObj: DailyExchange = {
                date: obj.Date,
                high: obj.High,
                low: obj.Low,
                open: obj.Open,
                volume: obj.Volume,
                close: obj.Close,
              };
              this.dailyValues = dailyExchangeObj;
            }
          });
          this.populateGraphValue(
            this.dailyValues,
            String(companiesFetched.pop())
          );
        });
        console.log(this.dataGraph.length);
      })
      .catch((err) => {
        console.log("There was an error in fetching", err);
      });
    // this.setState({ loaded: true });
  }

  populateGraphValue = (dailyValuesList: any, graphTitle: string) => {
    let tempObj: DailyDisplay = {
      name: graphTitle,
      daily: dailyValuesList,
    };

    console.log(tempObj);
    this.dataGraph.push(tempObj);
    console.log("Number of data in my list " + this.dataGraph.length);

    if (this.dataGraph.length >= this.companyList.length) {
      this.setState({ loaded: true });
    }
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
    return this.dataGraph.map((item) => {
      return <div key={item}> {this.displayStock(item)}</div>;
    });
  };

  public render() {
    return this.state.loaded ? (
      <div style={{ alignItems: "center", margin: "12px" }}>
        <div>These are the selected values</div>
        <div>{this.DisplayAll()}</div>
      </div>
    ) : (
      <div>
        <h2>loading...</h2>
      </div>
    );
  }
}

export default SelectedPoint;
