import React, { Component, useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import Plot from "react-plotly.js";
import * as companies from "../data/urlMatcher.json";
import { Link } from "react-router-dom";
import Select from "react-dropdown-select";

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

  const [fetchUrl, setfetchUrl] = useState<any>();
  const [trigger, setTrigger] = useState<boolean>(true);
  const [extension, setExtension] = useState("");
  const [value, setValue] = useState<string>("Close");
  const [xx, setxx] = useState<Date[]>([]);
  const [yy, setyy] = useState<number[]>([]);

  // const selectCompany = JSON.stringify(companies);
  // const selectCompanyArray: any[] = JSON.parse(selectCompany);
  // const fetching: string = selectCompanyArray.find(
  //   (comp) => comp.company === company
  // );
  const fetching = companies.companies.find((comp) => comp.company === company)
    ?.JsonUrl;
  // const fetching =
  //   "https://raw.githubusercontent.com/CS-21-07/jsonStorage/main/citrixstock.json";
  console.log("we are fetching: " + fetching);

  const companyName = companies.companies.find(
    (comp) => comp.company === company
  )?.name;

  const GraphTitle: string =
    companyName?.toUpperCase() + " - Stock Market: (" + option + ")";

  useEffect(() => {
    setfetchUrl(fetching);
    async function data(): Promise<any[]> {
      const response = await fetch(fetchUrl)
        .then(function (response: any) {
          console.log("Successful fetch");
          return response.json();
        })
        .catch((err) => {
          console.log("There was an error in fetching", err);
        });
      return Promise.resolve(response);
    }
    data().then((response) => {
      const stockEvents: any[] = response;
      console.log(stockEvents?.length);
      console.log(stockEvents);
      for (let i: number = 0; i < stockEvents?.length; i++) {
        // let obj: DailyExchange = stockEvents[i]; //extract(stockEvents[i]);
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
  }, [fetchUrl]);

  function populateGraphValue(): void {
    for (let i = 0; i < dailyValues.length; i++) {
      manageOption(dailyValues[i]);
      dates.push(toDateObject(dailyValues[i].date));
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
    <div style={{ alignItems: "center", margin: "12" }}>
      {/* <button
        className="btn btn-primary"
        id="authorize_button"
        onClick={handleAuthClick}
        style={{
          height: "100%",
          justifyContent: "center",
          alignSelf: "center",
          display: "block",
          float: "left",
          margin: 30,
        }}
      >
        display
      </button> */}
      <div>
        <Link to={"/home"} type="button">
          Go to Home
        </Link>
      </div>
      {/* <div>
        <Select
          options={options}
          values={options}
          onChange={(values) => setValues(values)}
        />
      </div> */}
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
        <a href={extension}>Visualize </a>
        {/* <Link to={extension} type="button" className="btn btn-primary">
          Visualize
        </Link> */}
      </div>
      <div>
        {trigger ? (
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
              },
              // { type: "bar", x: [1, 2, 3], y: [2, 5, 3] },
            ]}
            layout={{
              width: 1000,
              height: 600,
              title: GraphTitle,
            }}
          />
        ) : (
          <div>Error in loading the chart</div>
        )}
      </div>
    </div>
  );
};

export default GraphPage;
