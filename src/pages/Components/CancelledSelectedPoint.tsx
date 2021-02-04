import React, { Component, useState, useEffect } from "react";
// import Plot from "react-plotly.js";
import * as companies from "../../data/urlMatcher.json";
import "react-datepicker/dist/react-datepicker.css";
// npm install react-datepicker --save
import { Container, Row, Col } from "react-bootstrap";
//npm install react-bootstrap bootstrap

const SelectedPointInit: React.FC<{ company: string[]; dates: string[] }> = ({
  company,
  dates,
}) => {
  // setting to props parameters
  console.log(company);
  console.log(dates);
  const cleanDate: string = dates.length !== 0 ? dates[0].split(" ")[0] : "";
  console.log(cleanDate);

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

  let plotGraphData: any[] = [];

  const [dataGraph, setDataGraph] = useState<any[]>([]);

  useEffect(() => {
    // async function myFetch(toFetch: string): Promise<any[]> {
    //   const response = await fetch(toFetch)
    //     .then(function (response: any) {
    //       console.log("Successful fetch at " + toFetch);
    //       return response.json();
    //     })
    //     .catch((err) => {
    //       console.log("There was an error in fetching", err);
    //     });
    //   return Promise.resolve(response);
    // }

    async function myFetch(toFetch: string) {
      console.log("fetching2: " + toFetch);
      const response = await fetch(toFetch);
      //   return Promise.resolve(response);
      return response;
    }

    let myFetches: any[] = [];
    let companiesFetched: string[] = [];

    company.forEach((id) => {
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
    console.log(myFetches);
    Promise.all(myFetches)
      .then((files) => {
        files.forEach((file) => {
          process(file.json(), String(companiesFetched.pop()));
        });
      })
      .catch((err) => {
        console.log("There was an error in fetching", err);
      });

    //   dates.forEach((date) => {
    //       cleanDates.push(date.split(" ")[0]);
    //   })
  }, []);

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
          if (obj.Date === cleanDate) {
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
        });
        populateGraphValue(dailyValues, graphTitle);
      })
      .catch((err) => {
        console.log("There was an error in fetching", err);
      });
  }

  function populateGraphValue(
    dailyValuesList: any[],
    graphTitle: string
  ): void {
    console.log(dailyValuesList);
    dailyValuesList.forEach((daily) => {
      let tempObj: DailyDisplay = {
        name: graphTitle,
        daily: daily,
      };

      console.log(tempObj);
      plotGraphData = dataGraph;
      plotGraphData.push(tempObj);
      setDataGraph(plotGraphData);
      console.log("Number of data in my list " + dataGraph.length);
    });
    dates = [];
  }

  function displayStock(dailyObj) {
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
  }

  function DisplayAll() {
    return dataGraph.map((item) => {
      return <div key={item.name}> {displayStock(item)}</div>;
    });
  }

  return (
    <div style={{ alignItems: "center", margin: "12px" }}>
      <div>These are the selected values</div>
      {DisplayAll()}
    </div>
  );
};

export default SelectedPointInit;
