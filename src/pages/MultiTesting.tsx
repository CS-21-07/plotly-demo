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

interface GraphPagePropsInterface extends RouteComponentProps<{}> {
  // Other props that belong to component it self not Router
}

const MultiTesting: React.FC<GraphPagePropsInterface> = (
  props: GraphPagePropsInterface
) => {
  const trace1 = {
    x: [1, 2, 3],
    y: [7, 5, 6],
    name: "yaxis1 data",
    yaxis: "y",
    type: "scatter",
  };
  console.log(trace1);

  const trace2 = {
    x: [2, 3, 4],
    y: [40, 50, 80],
    name: "yaxis2 data",
    yaxis: "y2",
    type: "scatter",
  };
  console.log(trace2);

  const trace3 = {
    x: [1, 3, 5],
    y: [40000, 50000, 60000],
    name: "yaxis3 data",
    yaxis: "y3",
    type: "scatter",
  };
  console.log(trace3);

  const trace4 = {
    x: [7, 6, 5],
    y: [400000, 500000, 600000],
    name: "yaxis4 data",
    yaxis: "y4",
    type: "scatter",
  };
  console.log(trace4);

  const data = [trace1, trace2, trace3, trace4];

  const layout = {
    title: "multiple y-axes example",
    width: 800,
    xaxis: { domain: [0.3, 0.7] },
    yaxis: {
      title: "yaxis title",
      titlefont: { color: "#1f77b4" },
      tickfont: { color: "#1f77b4" },
    },
    yaxis2: {
      title: "yaxis2 title",
      titlefont: { color: "#ff7f0e" },
      tickfont: { color: "#ff7f0e" },
      anchor: "free",
      overlaying: "y",
      side: "left",
      position: 0.15,
    },
    yaxis3: {
      title: "yaxis4 title",
      titlefont: { color: "#d62728" },
      tickfont: { color: "#d62728" },
      anchor: "x",
      overlaying: "y",
      side: "right",
    },
    yaxis4: {
      title: "yaxis5 title",
      titlefont: { color: "#9467bd" },
      tickfont: { color: "#9467bd" },
      anchor: "free",
      overlaying: "y",
      side: "right",
      position: 0.85,
    },
  };

  return (
    <div>
      <Plot data={data} layout={layout} />
    </div>
  );
};

export default MultiTesting;
