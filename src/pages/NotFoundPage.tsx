import React, { Component, useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import Plot from "react-plotly.js";
import { Link } from "react-router-dom";

interface PageNotFoundPropsInterface extends RouteComponentProps<{}> {
  // Other props that belong to component it self not Router
}

const PageNotFound: React.FC<PageNotFoundPropsInterface> = () => {
  return (
    <div style={{ alignItems: "center", textAlign: "center" }}>
      <h1>NOT FOUND</h1>
      <div>
        <div>
          <h2>404 - ERROR IN THE ROUTE</h2>
        </div>
        <div>
          <Link to={"/home"} type="button">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
