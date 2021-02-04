import React, { Component, useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
// import Plot from "react-plotly.js";
import * as companies from "../../data/urlMatcher.json";
import { Link } from "react-router-dom";
import Select from "react-dropdown-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Spin } from "antd";
// npm install react-datepicker --save
import { Container, Row, Col } from "react-bootstrap";
//npm install react-bootstrap bootstrap

import Plotly from "plotly.js";
import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);

export interface SingleGraphProps
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

class SingleGraph extends React.Component<SingleGraphProps> {
  private company: string;
  private option: string;

  dailyValues: DailyExchange[] = [];
  dailyValuesOrdinate: number[] = [];
  dates: Date[] = [];
  //   const defaultStartDate: Date = new Date(2000, 0, 0);
  //   const defaultEndDate: Date = new Date();

  fetchUrl: any;
  trigger: boolean = true;
  extension: string = "";
  value: string = "Close";
  xx: Date[] = [];
  yy: number[] = [];
  isVolume: boolean;
  // startDate: Date = new Date(2000, 0, 0);
  // endDate: Date = new Date();
  GraphTitle: string;
  stockEvents: any[] = [];

  state = {
    loading: true,
    startDate: new Date(2000, 0, 0),
    endDate: new Date(),
  };

  constructor(props: SingleGraphProps) {
    super(props);
    this.company = this.props.match.params.company;
    this.option = this.props.match.params.option;
    this.isVolume = this.value === "Volume";
    const fetching = companies.companies.find(
      (comp) => comp.company === this.company
    )?.JsonUrl;
    console.log("we are fetching: " + fetching);

    const companyName = companies.companies.find(
      (comp) => comp.company === this.company
    )?.name;

    this.GraphTitle =
      companyName?.toUpperCase() + " - Stock Market: (" + this.option + ")";
    this.value = this.option;

    this.fetchUrl = fetching;
  }

  private populateGraphValue = () => {
    for (let i = 0; i < this.dailyValues.length; i++) {
      const tempDate = this.toDateObject(this.dailyValues[i].date);
      if (tempDate >= this.state.startDate && tempDate <= this.state.endDate) {
        this.manageOption(this.dailyValues[i]);
        this.dates.push(tempDate);
      }
    }
    this.xx = this.dates;
    this.yy = this.dailyValuesOrdinate;
  };

  private manageOption = (obj: DailyExchange): void => {
    switch (this.option) {
      case "close":
        this.dailyValuesOrdinate.push(obj.close);
        break;
      case "high":
        this.dailyValuesOrdinate.push(obj.high);
        break;
      case "low":
        this.dailyValuesOrdinate.push(obj.low);
        break;
      case "volume":
        this.dailyValuesOrdinate.push(obj.volume);
        this.isVolume = true;
        break;
      case "open":
        this.dailyValuesOrdinate.push(obj.open);
        break;
      default:
        this.dailyValuesOrdinate.push(obj.close);
        break;
    }
  };

  private toDateObject = (dateString: string): Date => {
    const temp: string[] = dateString.split("-");
    const date: Date = new Date();
    date.setFullYear(parseInt(temp[0]), parseInt(temp[1]), parseInt(temp[2]));
    return date;
  };

  private onFetchData = async (toFetch: string) => {
    const response = await fetch(toFetch)
      .then(function (response: any) {
        console.log("Successful fetch at " + toFetch);
        return response.json();
      })
      .catch((err) => {
        console.log("There was an error in fetching", err);
      });
    return Promise.resolve(response);
  };

  //   change: function(event){
  //     this.setState({value: event.target.value});
  // },

  private handleChange = (event) => {
    const linkvalue: string = event.target.value;
    this.setState({ valueoh: event.target.value });
    this.value = linkvalue;
    this.extension = "/visual/" + this.company + "/" + linkvalue.toLowerCase();
    console.log(this.extension);
  };

  async componentDidMount() {
    const response = await fetch(this.fetchUrl);
    const data = await response.json();

    this.stockEvents = data;
    // const stockEvents: any[] = data;
    console.log(this.stockEvents?.length);
    console.log(this.stockEvents);
    for (let i: number = 0; i < this.stockEvents?.length; i++) {
      let tempString: string = JSON.stringify(this.stockEvents[i]); //extract(stockEvents[i]);
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
    }
    this.populateGraphValue();

    this.setState({ loading: false });
  }

  public render() {
    return !this.state.loading ? (
      <div style={{ alignItems: "center", margin: "12px" }}>
        <div style={{ paddingBottom: "15px" }}>
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
          <a href={this.extension} style={{ paddingLeft: "8px" }}>
            Visualize{" "}
          </a>
        </div>
        <div>
          {!this.isVolume ? (
            <Plot
              data={[
                {
                  // x: [1, 2, 3, 7],
                  // y: [2, 6, 3, 9],
                  x: this.xx,
                  y: this.yy,
                  type: "scatter",
                  // mode: "lines+markers",
                  mode: "lines",
                  marker: { color: "red" },
                  name: "Data",
                },
              ]}
              //onClick={window.alert("I clicked on a dot")}
              legend={{
                orientation: "h",
                yanchor: "right",
              }}
              layout={{
                showlegend: true,
                width: 1000,
                height: 600,
                title: {
                  text: this.GraphTitle,
                  font: {
                    size: 24,
                  },
                },
                grid: {
                  yside: "right plot",
                },
                xaxis: {
                  visible: true,
                  color: "#2c3e50",
                  title: {
                    text: "Dates",
                  },
                },
                yaxis: {
                  visible: true,
                  color: "#2c3e50",
                  title: {
                    text: "Values",
                  },
                },
              }}
            />
          ) : (
            <div></div>
          )}
          {this.isVolume ? (
            <Plot
              data={[
                {
                  x: this.xx,
                  y: this.yy,
                  type: "bar",
                  mode: "lines",
                  marker: { color: "red" },
                },
              ]}
              layout={{
                width: 1000,
                height: 600,
                title: this.GraphTitle,
              }}
            />
          ) : (
            <div></div>
          )}
        </div>
        <Container fluid="md">
          <Row>
            <div>
              <Col>
                <div>
                  <h3> change start Date </h3>
                  <DatePicker
                    selected={this.state.startDate}
                    onChange={(date) => this.setState({ startDate: date })}
                    showTimeSelect
                    dateFormat="Pp"
                  />
                </div>
              </Col>
              <Col>
                <div>
                  <h3> change End Date </h3>
                  <DatePicker
                    selected={this.state.endDate}
                    onChange={(date) => this.setState({ endDate: date })}
                    showTimeSelect
                    dateFormat="Pp"
                  />
                </div>
              </Col>
            </div>
          </Row>
        </Container>
      </div>
    ) : (
      <Spin />
      //   <div>...Loading</div>
    );
  }
}

export default SingleGraph;
