import React, { Component, useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import * as companies from "../data/urlMatcher.json";
// npm install @emotion/react
// npm install @emotion/styled

interface HomePagePropsInterface extends RouteComponentProps<{}> {
  // Other props that belong to component it self not Router
}

const HomePage: React.FC<HomePagePropsInterface> = () => {
  const [extension, setExtension] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [multipleExtension, setMultipleExtension] = useState<string>("");
  const [isSelected, SetIsSelected] = useState<boolean>();
  const [includedIds, setIncludedIds] = useState<string[]>([]);
  const [companyInfo, SetCompanyinfo] = useState<CompanyInfo[]>([]);

  const companyList = companies.companies;

  type CompanyInfo = {
    name: string;
    tag: string;
    id: string;
  };

  useEffect(() => {
    let tempArray: CompanyInfo[] = [];
    for (let i: number = 0; i < companyList.length; i++) {
      let tempObj: CompanyInfo = {
        name: companyList[i].name,
        id: companyList[i].id,
        tag: companyList[i].company,
      };
      tempArray.push(tempObj);
    }
    SetCompanyinfo(tempArray);
  }, []);

  function buildLink(company: string): string {
    const link = "/visual/" + company + "/close";
    return link;
  }

  function buildLinkMultiple(company: string): string {
    const link = "/visualMultiple/" + company + "/close";
    console.log(link);
    return link;
  }

  //visualMultiple
  function handleCheckedBoxes(ChangeEvent) {
    const id: string = ChangeEvent.target.value;
    let found: boolean = false;
    for (let i = 0; i < includedIds.length; i++) {
      if (includedIds[i] === id) {
        found = true;
      }
    }
    if (found) {
      // remove from include
      const tempArray = includedIds.filter((item) => item != id);
      console.log("EXIST");
      setIncludedIds(tempArray);
    } else {
      console.log("N-EXIST");
      const tempArray = includedIds;
      tempArray.push(id);
      setIncludedIds(tempArray);
    }
    console.log(includedIds);
    handleMultipleSelect();
  }

  function handleSelection(ChangeEvent) {
    const value: string = ChangeEvent.target.value;
    setExtension(buildLink(value));
    setSelectedOption(value);
  }

  function handleMultipleSelect() {
    let lists: string = "";
    for (const id of includedIds) {
      lists = lists.concat(id.concat("+"));
    }
    // setMultipleExtension(lists);
    console.log(multipleExtension);
    setMultipleExtension(buildLinkMultiple(lists));
  }

  const LinkName = styled.div`
    paddingbottom: 1rem;
  `;

  function createAllRadioButton() {
    return companyInfo.map((item) => {
      return <div key={item.tag}>{createRadioButton(item.tag, item.name)}</div>;
    });
  }

  function createRadioButton(tag: string, name: string) {
    return (
      <div className="radio">
        <label>
          <input
            type="radio"
            value={tag}
            checked={selectedOption === tag}
            onChange={handleSelection}
          />
          {name}
        </label>
      </div>
    );
  }

  function createAllCheckBoxes() {
    return companyInfo.map((item) => {
      return <div key={item.id}>{createCheckBoxes(item.id, item.name)}</div>;
    });
  }

  function createCheckBoxes(tag: string, name: string) {
    return (
      <div className="checkbox">
        <label>
          <input
            type="checkbox"
            value={tag}
            checked={includedIds.some((item) => item === tag)}
            onChange={handleCheckedBoxes}
          />
          {name}
        </label>
      </div>
    );
  }

  return (
    <div style={{ alignItems: "center", margin: "25px" }}>
      <h1 style={{ alignItems: "center" }}>
        Welcome to The Graphing Tool Demo
      </h1>
      <div>
        <div>
          <h2>Please select from the following option</h2>
        </div>
        <form>{createAllRadioButton()}</form>
        <div style={{ paddingTop: "15px" }}>
          <Link to={extension} type="submit" className="btn btn-default">
            Visualize The selected Stock
          </Link>
        </div>
      </div>

      <div>
        <div>
          <h2>Please select 1 or more from the following option to display</h2>
        </div>
        <form>{createAllCheckBoxes()}</form>
        <div style={{ paddingTop: "15px" }}>
          {/* <a href={multipleExtension} onClick={handleMultipleSelect}>
            Visualize The selected Stocks
          </a> */}
          <Link
            to={multipleExtension}
            type="submit"
            className="btn btn-default"
          >
            Visualize The selected Stocks
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
