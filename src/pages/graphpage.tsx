import React, { Component, useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
// import Plot from "react-plotly.js";
import * as companies from "../data/urlMatcher.json";
import { Link } from "react-router-dom";
import Select from "react-dropdown-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// npm install react-datepicker --save
import { Container, Row, Col } from "react-bootstrap";
//npm install react-bootstrap bootstrap

import Plotly from "plotly.js";
import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);

interface GraphPagePropsInterface
  extends RouteComponentProps<{ company: string; option: string }> {
  // Other props that belong to component it self not Router
}

const GraphPage: React.FC<GraphPagePropsInterface> = (
  props: GraphPagePropsInterface
) => {
  // setting to props parameters
  const company = props.match.params.company;
  const option = props.match.params.option;

  type DailyExchange = {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    adjClose?: number;
    volume: number;
  };

  const dailyValues: DailyExchange[] = [];
  let dailyValuesOrdinate: number[] = [];
  let dates: Date[] = [];
  const defaultStartDate: Date = new Date(2000, 0, 0);
  const defaultEndDate: Date = new Date();

  const [fetchUrl, setfetchUrl] = useState<any>();
  const [trigger, setTrigger] = useState<boolean>(true);
  const [extension, setExtension] = useState("");
  const [value, setValue] = useState<string>("Close");
  const [xx, setxx] = useState<Date[]>([]);
  const [yy, setyy] = useState<number[]>([]);
  const [isVolume, SetIsVolume] = useState(value === "Volume");
  const [startDate, setStartDate] = useState<Date>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date>(defaultEndDate);

  // const selectCompany = JSON.stringify(companies);
  // const selectCompanyArray: any[] = JSON.parse(selectCompany);
  // const fetching: string = selectCompanyArray.find(
  //   (comp) => comp.company === company
  // );
  const fetching = companies.companies.find((comp) => comp.company === company)
    ?.JsonUrl;
  console.log("we are fetching: " + fetching);

  const companyName = companies.companies.find(
    (comp) => comp.company === company
  )?.name;

  const GraphTitle: string =
    companyName?.toUpperCase() + " - Stock Market: (" + option + ")";

  useEffect(() => {
    setfetchUrl(fetching);
    async function data(toFetch: string): Promise<any[]> {
      const response = await fetch(toFetch)
        .then(function (response: any) {
          console.log("Successful fetch at " + toFetch);
          return response.json();
        })
        .catch((err) => {
          console.log("There was an error in fetching", err);
        });
      return Promise.resolve(response);
    }
    data(fetchUrl).then((response) => {
      const stockEvents: any[] = response;
      console.log(stockEvents?.length);
      console.log(stockEvents);
      for (let i: number = 0; i < stockEvents?.length; i++) {
        let tempString: string = JSON.stringify(stockEvents[i]); //extract(stockEvents[i]);
        let obj = JSON.parse(tempString);
        let dailyExchangeObj: DailyExchange = {
          date: obj.Date,
          high: obj.High,
          low: obj.Low,
          open: obj.Open,
          volume: obj.Volume,
          close: obj.Close,
        };
        dailyValues.push(dailyExchangeObj);
      }
      populateGraphValue();
    });
    setValue(option);
  }, [fetchUrl, startDate, endDate]);

  function populateGraphValue(): void {
    for (let i = 0; i < dailyValues.length; i++) {
      const tempDate = toDateObject(dailyValues[i].date);
      if (tempDate >= startDate && tempDate <= endDate) {
        manageOption(dailyValues[i]);
        dates.push(tempDate);
      }
    }
    setxx(dates);
    setyy(dailyValuesOrdinate);
  }

  function manageOption(obj: DailyExchange): void {
    switch (option) {
      case "close":
        dailyValuesOrdinate.push(obj.close);
        break;
      case "high":
        dailyValuesOrdinate.push(obj.high);
        break;
      case "low":
        dailyValuesOrdinate.push(obj.low);
        break;
      case "volume":
        dailyValuesOrdinate.push(obj.volume);
        SetIsVolume(true);
        break;
      case "open":
        dailyValuesOrdinate.push(obj.open);
        break;
      default:
        dailyValuesOrdinate.push(obj.close);
        break;
    }
  }

  function extract(obj: any): DailyExchange {
    // given an object, it return the DailyExchange corresponding
    let temp: DailyExchange = {
      date: obj.Date,
      high: obj.High,
      low: obj.Low,
      open: obj.Open,
      volume: obj.Volume,
      close: obj.close,
    };

    return temp;
  }

  function toDateObject(dateString: string): Date {
    const temp: string[] = dateString.split("-");
    const date: Date = new Date();
    date.setFullYear(parseInt(temp[0]), parseInt(temp[1]), parseInt(temp[2]));
    return date;
  }

  function handleAuthClick(event: any) {
    setTrigger(!trigger);
  }

  function handleChange(event) {
    const linkvalue: string = event.target.value;
    setValue(linkvalue);
    setExtension("/visual/" + company + "/" + linkvalue.toLowerCase());
    console.log(extension);
  }

  const options = ["volume", "open", "close", "high", "low"];

  return (
    <div style={{ alignItems: "center", margin: "12px" }}>
      <div style={{ paddingBottom: "15px" }}>
        <Link to={"/home"} type="button">
          Go to Home
        </Link>
      </div>
      <div>
        <label>
          Pick the chart to display:
          <select value={value} onChange={handleChange}>
            <option value="Close">Select from Menu</option>
            <option value="Open">Open</option>
            <option value="Volume">Volume</option>
            <option value="Close">Close</option>
            <option value="High">High</option>
            <option value="Low">Low</option>
          </select>
        </label>
        <a href={extension} style={{ paddingLeft: "8px" }}>
          Visualize{" "}
        </a>
        {/* <Link to={extension} type="button" className="btn btn-primary">
          Visualize
        </Link> */}
      </div>
      <div>
        {!isVolume ? (
          <Plot
            data={[
              {
                // x: [1, 2, 3, 7],
                // y: [2, 6, 3, 9],
                x: xx,
                y: yy,
                type: "scatter",
                // mode: "lines+markers",
                mode: "lines",
                marker: { color: "red" },
                name: "Data",
              },
              // ,
              // {
              //   x: [1, 2, 3, 7],
              //   y: [2, 6, 3, 9],
              //   type: "scatter",
              //   // mode: "lines+markers",
              //   mode: "lines",
              //   marker: { color: "red" },
              // },
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
                text: GraphTitle,
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
        {isVolume ? (
          <Plot
            data={[
              {
                x: xx,
                y: yy,
                type: "bar",
                mode: "lines",
                marker: { color: "red" },
              },
            ]}
            //onClick={window.alert("I clicked on a dot")}
            layout={{
              width: 1000,
              height: 600,
              title: GraphTitle,
            }}
          />
        ) : (
          <div></div>
        )}
      </div>
      {/* <div className="container">
        <div className="row">
          <div>
            <div className="col-sm-12">
              <h3> change start Date </h3>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
              />
            </div>
            <div className="col-sm-12">
              <h3> change End Date </h3>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
              />
            </div>
          </div>
        </div>
      </div> */}
      <Container fluid="md">
        <Row>
          <div>
            <Col>
              <div>
                <h3> change start Date </h3>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  showTimeSelect
                  dateFormat="Pp"
                />
              </div>
            </Col>
            <Col>
              <div>
                <h3> change End Date </h3>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  showTimeSelect
                  dateFormat="Pp"
                />
              </div>
            </Col>
          </div>
        </Row>
      </Container>
    </div>
  );
};

export default GraphPage;
