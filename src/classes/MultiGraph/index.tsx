import React, { Component, useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
// import Plot from "react-plotly.js";
import * as companies from "../../data/urlMatcher.json";
import { Link } from "react-router-dom";
import Select from "react-dropdown-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// npm install react-datepicker --save
import { Container, Row, Col } from "react-bootstrap";
//npm install react-bootstrap bootstrap

import Plotly from "plotly.js";
import createPlotlyComponent from "react-plotly.js/factory";
import SelectedPoint from "../SelectedPoint";
const Plot = createPlotlyComponent(Plotly);

export interface MultiGraphProps
  extends RouteComponentProps<{ company: string; option: string }> {
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

type PlotGraph = {
  x: any[];
  y: any[];
  type: string;
  mode?: string;
  name?: string;
  yaxis: string;
};

class MultiGraph extends React.Component<MultiGraphProps> {
  private company: string;
  private option: string;

  dailyValues: DailyExchange[] = [];
  //   dailyValuesOrdinate: number[] = [];
  //   dates: Date[] = [];
  //   const defaultStartDate: Date = new Date(2000, 0, 0);
  //   const defaultEndDate: Date = new Date();

  fetchUrl: any;
  trigger: boolean = true;
  extension: string = "";
  value: string = "Close";
  xx: Date[] = [];
  yy: number[] = [];
  isVolume: boolean;
  startDate: Date = new Date(2000, 0, 0);
  endDate: Date = new Date();
  GraphTitle: string;
  companyList: string[];
  dataGraph: any[] = [];
  //   plotGraphData: any[] = [];
  xValues: string[] = [];
  stockEvents: any[] = [];
  viewData: string = "";

  state = {
    loaded: false,
    selected: false,
    points: [],
    dataLink: "",
  };

  yaxis = {
    title: "Stock Price",
    // titlefont: { color: "#1f77b4" },
    // tickfont: { color: "#1f77b4" },
  };

  yaxis2 = {
    title: "",
    visible: false,
    // titlefont: { color: "#ff7f0e" },
    // tickfont: { color: "#ff7f0e" },
    anchor: "x",
    overlaying: "y",
    side: "left",
    position: 0.15,
  };
  yaxis3 = {
    title: "Stock Price",
    // visible: false,
    // titlefont: { color: "#d62728" },
    // tickfont: { color: "#d62728" },
    anchor: "x",
    overlaying: "y",
    side: "right",
  };
  // yaxis4 = {
  //   title: "yaxis5 title",
  //   titlefont: { color: "#9467bd" },
  //   tickfont: { color: "#9467bd" },
  //   anchor: "x",
  //   overlaying: "y",
  //   side: "right",
  //   position: 0.85,
  // };
  yaxis4 = {
    title: "",
    visible: false,
    // titlefont: { color: "#9467bd" },
    // tickfont: { color: "#9467bd" },
    anchor: "x",
    overlaying: "y",
    side: "right",
    position: 0.85,
  };

  constructor(props: MultiGraphProps) {
    super(props);
    this.company = this.props.match.params.company;
    this.option = this.props.match.params.option;
    this.isVolume = this.value === "Volume";
    this.companyList = this.company.split("+").filter((elm) => elm !== "");
    this.value = this.option;
  }

  populateGraphValue = (dailyValuesList: any[], graphTitle: string) => {
    let dailyValuesOrdinate: number[] = [];
    let dates: Date[] = [];

    // console.log(dailyValuesList);
    dailyValuesList.forEach((daily) => {
      dailyValuesOrdinate.push(this.manageOption(daily));
      dates.push(this.toDateObject(daily.date));
    });

    const graphData: PlotGraph = {
      x: dates,
      y: dailyValuesOrdinate,
      type: "scatter",
      yaxis: "y".concat(
        this.dataGraph.length === 0
          ? ""
          : (this.dataGraph.length + 1).toString()
      ),
      name: graphTitle,
    };
    console.log(graphData);
    this.dataGraph.push(graphData);
    console.log("Number of graph in my list " + this.dataGraph.length);
    // dates = [];
    // dailyValuesOrdinate = [];
    if (this.dataGraph.length === this.companyList.length) {
      this.setState({ loaded: true });
    }
  };

  manageOption = (obj: DailyExchange): number => {
    switch (this.option) {
      case "close":
        return obj.close;
      case "high":
        return obj.high;
      case "low":
        return obj.low;
      case "volume":
        return obj.volume;
      case "open":
        return obj.open;
      default:
        return obj.close;
    }
  };

  private handleSelection = (eventData) => {
    let x: any[] = [];
    let y: any[] = [];
    this.setState({ points: eventData.points });
    this.state.points.forEach((pt: any) => {
      x.push(pt.x);
      y.push(pt.y);
      console.log("x: " + x);
    });

    this.xValues = x;
    console.log(x);
    console.log(y);

    // return alert("Values Displayed");
    this.viewData =
      "/PointInfo/" + this.company + "/" + this.xValues[0].split(" ")[0];
    console.log(this.viewData);

    this.setState({ selected: true, dataLink: this.viewData });
    // return (

    //   //   <a href={newLink} style={{ paddingLeft: "8px" }}>
    //   //     View Data
    //   //   </a>
    // );
  };

  private toDateObject = (dateString: string): Date => {
    const temp: string[] = dateString.split("-");
    const date: Date = new Date();
    date.setFullYear(parseInt(temp[0]), parseInt(temp[1]), parseInt(temp[2]));
    return date;
  };

  private handleChange = (event) => {
    const linkvalue: string = event.target.value;
    this.setState({ value: event.target.value });
    this.value = linkvalue;
    this.extension =
      "/visualMultiple/" + this.company + "/" + linkvalue.toLowerCase();
    console.log(this.extension);
  };

  async componentDidMount() {
    async function myFetch(toFetch: string) {
      const response = await fetch(toFetch);
      //   return Promise.resolve(response);
      return response;
    }
    let myFetches: any[] = [];
    let companiesFetched: string[] = [];

    this.companyList.forEach((id) => {
      // companyUrl.forEach((id) => {
      if (id !== "") {
        const fetching = companies.companies.find((comp) => comp.id === id)
          ?.JsonUrl;
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
          this.dailyValues = [];
          this.stockEvents = data;
          console.log(this.stockEvents?.length);
          console.log(this.stockEvents);
          this.stockEvents.forEach((stocky) => {
            let tempString: string = JSON.stringify(stocky); //extract(stockEvents[i]);
            let obj = JSON.parse(tempString);
            let dailyExchangeObj: DailyExchange = {
              date: obj.Date,
              high: obj.High,
              low: obj.Low,
              open: obj.Open,
              volume: obj.Volume,
              close: obj.Close,
            };
            this.dailyValues.push(dailyExchangeObj);
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

  public render() {
    // const { this.props , {},  } = this.state
    // const isLoading = this.props.isLoading
    // const bugs = this.bugStore.bugs

    return this.state.loaded ? (
      <div style={{ alignItems: "center", margin: "12" }}>
        <div>
          <Link to={"/home"} type="button">
            Go to Home
          </Link>
        </div>
        <div>
          <label>
            Pick the chart to display:
            <select value={this.value} onChange={this.handleChange}>
              <option value="Close">Select from Menu</option>
              <option value="Open">Open</option>
              <option value="Volume">Volume</option>
              <option value="Close">Close</option>
              <option value="High">High</option>
              <option value="Low">Low</option>
            </select>
          </label>
          <a href={this.extension}> Visualize </a>
        </div>
        <div>
          <Plot
            onClick={this.handleSelection}
            data={this.dataGraph}
            layout={{
              showlegend: true,
              width: 1200,
              height: 600,
              title: "Multi Axes",
              xaxis: {
                visible: true,
                color: "#2c3e50",
                title: {
                  text: "Dates",
                },
              },
              grid: {
                yside: "right plot",
              },
              yaxis: this.yaxis,
              yaxis2: this.yaxis3,
              yaxis3: this.yaxis4,
              yaxis4: this.yaxis4,
            }}
          />
        </div>
        <div>
          {this.state.selected ? (
            <div>
              <div>You Selected data at date: </div>
              <div>{this.xValues[0].split(" ")[0]}</div>
              {/* <SelectedPoint
                companies={this.company}
                dates={this.xValues[0].split(" ")[0]}
              /> */}
              <Link to={this.state.dataLink} type="button">
                View Data
              </Link>
              {/* <a href={this.viewData} style={{ paddingLeft: "8px" }}>
                View Data
              </a> */}
            </div>
          ) : (
            <div>
              <h2>Nothing is selected</h2>
            </div>
          )}
        </div>
      </div>
    ) : (
      <div>loading...</div>
    );
  }
}

export default MultiGraph;
