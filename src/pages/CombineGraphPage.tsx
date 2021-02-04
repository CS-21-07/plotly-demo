import React, { Component, useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
// import Plot from "react-plotly.js";
import * as companies from "../data/urlMatcher.json";
import { Link } from "react-router-dom";

import Plotly from "plotly.js";
import createPlotlyComponent from "react-plotly.js/factory";
import SelectedPoint from "./Components/SelectedPoint";
// import SelectedPoint from "./Components/SelectedPoint";
const Plot = createPlotlyComponent(Plotly);

interface CombineGraphPropsInterface
  extends RouteComponentProps<{ company: string; option: string }> {
  // Other props that belong to component it self not Router
}

const CombineGraph: React.FC<CombineGraphPropsInterface> = (
  props: CombineGraphPropsInterface
) => {
  // setting to props parameters
  const company = props.match.params.company;
  const option = props.match.params.option;

  const companyList: string[] = company.split("+").filter((elm) => elm !== "");
  console.log(companyList);

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

  const yaxis = {
    title: "yaxis title",
    titlefont: { color: "#1f77b4" },
    tickfont: { color: "#1f77b4" },
  };

  const yaxis2 = {
    title: "yaxis2 title",
    titlefont: { color: "#ff7f0e" },
    tickfont: { color: "#ff7f0e" },
    anchor: "x",
    overlaying: "y",
    side: "left",
    position: 0.15,
  };
  const yaxis3 = {
    title: "yaxis4 title",
    titlefont: { color: "#d62728" },
    tickfont: { color: "#d62728" },
    anchor: "x",
    overlaying: "y",
    side: "right",
  };
  const yaxis4 = {
    title: "yaxis5 title",
    titlefont: { color: "#9467bd" },
    tickfont: { color: "#9467bd" },
    anchor: "x",
    overlaying: "y",
    side: "right",
    position: 0.85,
  };

  let plotGraphData: any[] = [];

  const [xValues, SetxValues] = useState<string[]>([]);
  const [trigger, setTrigger] = useState<boolean>(false);
  const [extension, setExtension] = useState("");
  const [value, setValue] = useState<string>("Close");
  const [GraphTitle, setGraphTitle] = useState("");
  const [dataGraph, setDataGraph] = useState<any[]>([]);

  function toDateObject(dateString: string): Date {
    const temp: string[] = dateString.split("-");
    const date: Date = new Date();
    date.setFullYear(parseInt(temp[0]), parseInt(temp[1]), parseInt(temp[2]));
    return date;
  }

  useEffect(() => {
    async function myFetch(toFetch: string) {
      console.log("fetching2: " + toFetch);
      const response = await fetch(toFetch);
      return Promise.resolve(response);
      // return response;
    }

    let myFetches: any[] = [];
    let companiesFetched: string[] = [];

    companyList.forEach((id) => {
      // companyUrl.forEach((id) => {
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
        files.forEach((file) => {
          process(file.json(), String(companiesFetched.pop()));
        });
      })
      .catch((err) => {
        console.log("There was an error in fetching", err);
      });
    setValue(option);
    setTrigger(false);
  }, []);

  function populateGraphValue(
    dailyValuesList: any[],
    graphTitle: string
  ): void {
    let dailyValuesOrdinate: number[] = [];
    let dates: Date[] = [];

    console.log(dailyValuesList);
    dailyValuesList.forEach((daily) => {
      dailyValuesOrdinate.push(manageOption(daily));
      dates.push(toDateObject(daily.date));
    });

    const graphData: PlotGraph = {
      x: dates,
      y: dailyValuesOrdinate,
      type: "scatter",
      yaxis: "y".concat(
        plotGraphData.length === 0 ? "" : (plotGraphData.length + 1).toString()
      ),
      name: graphTitle,
    };
    console.log(graphData);
    plotGraphData = dataGraph;
    plotGraphData.push(graphData);
    setDataGraph(plotGraphData);
    console.log("Number of graph in my list " + plotGraphData.length);
    dates = [];
    dailyValuesOrdinate = [];
  }

  function manageOption(obj: DailyExchange): number {
    switch (option) {
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
  }

  function process(prom, graphTitle: string) {
    let dailyValues: DailyExchange[] = [];
    prom
      .then((data) => {
        const stockEvents: any[] = data;
        console.log(stockEvents?.length);
        console.log(stockEvents);
        stockEvents.forEach((stocky) => {
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
          dailyValues.push(dailyExchangeObj);
        });
        populateGraphValue(dailyValues, graphTitle);
      })
      .catch((err) => {
        console.log("There was an error in fetching", err);
      });
  }

  function handleChange(event) {
    const linkvalue: string = event.target.value;
    setValue(linkvalue);
    setExtension("/visualMultiple/" + company + "/" + linkvalue.toLowerCase());
    console.log(extension);
  }

  function handleSelection(eventData) {
    let x: any[] = [];
    let y: any[] = [];
    eventData.points.forEach((pt) => {
      x.push(pt.x);
      y.push(pt.y);
      console.log("x: " + x);
    });

    SetxValues(x);
    console.log(x);
    console.log(y);
    setTrigger(true);
    return alert("Values Displayed");
  }

  // useEffect(() => {
  //   setTrigger(true);
  // }, [xValues]);

  return (
    <div style={{ alignItems: "center", margin: "12" }}>
      <div>
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
        <a href={extension}> Visualize </a>
      </div>
      <div>
        <Plot
          onClick={handleSelection}
          data={dataGraph}
          layout={{
            width: 1200,
            // height: 600,
            title: "Double Y Axis Example",
            yaxis: yaxis,
            yaxis2: yaxis3,
            yaxis3: yaxis4,
            yaxis4: yaxis4,
          }}
        />
      </div>
      <div>
        <div>
          <div>{companyList}</div>
          <div>{xValues}</div>
          <SelectedPoint company={companyList} dates={xValues} />
        </div>
      </div>
    </div>
  );
};

export default CombineGraph;
