import React, { Component, useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
//  npm install @emotion/react
//  npm install @emotion/styled

interface HomePagePropsInterface extends RouteComponentProps<{}> {
  // Other props that belong to component it self not Router
}

const HomePage: React.FC<HomePagePropsInterface> = () => {
  const ffiveExtension = "/visual/ffive/close";
  const citrixExtension = "/visual/citrix/close";

  const LinkName = styled.div`
    paddingbottom: 1rem;
  `;

  return (
    <div style={{ alignItems: "center" }}>
      <h1 style={{ alignItems: "center" }}>
        Welcome to The Graphind Tool Demo
      </h1>
      <div>
        <div>
          <h2>Please select from the following option</h2>
        </div>
        <LinkName>
          <Link to={ffiveExtension} type="button">
            Visualize F-5 Stocks
          </Link>
        </LinkName>
        <LinkName>
          <Link to={citrixExtension} type="button">
            Visualize Citrix Stocks
          </Link>
        </LinkName>
      </div>
    </div>
  );
};

export default HomePage;
