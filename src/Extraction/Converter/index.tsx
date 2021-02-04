import React, { Component, useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import axios from 'axios';

import "react-datepicker/dist/react-datepicker.css";


import Plotly from "plotly.js";
import createPlotlyComponent from "react-plotly.js/factory";
const Plot = createPlotlyComponent(Plotly);

export interface SingleGraphProps
  extends RouteComponentProps<{ }> {
  // Other props that belong to component it self not Router
}


class Converter extends React.Component<SingleGraphProps> {

    
  state = {
    data: ""
  };

 xml2json(xml: any, tab: any) {
        let X = {
          toObj: function (xml: any) {
            let o: any = {};
            console.log("THIS: " + xml.nodeType);
            if (xml.nodeType === 1) {
              // element node ..
              if (xml.attributes.length)
                // element with attributes  ..
                for (let i = 0; i < xml.attributes.length; i++)
                  o["@" + xml.attributes[i].nodeName] = (
                    xml.attributes[i].nodeValue || ""
                  ).toString();
              if (xml.firstChild) {
                // element has child nodes ..
                let textChild = 0,
                  cdataChild = 0,
                  hasElementChild = false;
                for (let n = xml.firstChild; n; n = n.nextSibling) {
                  if (n.nodeType === 1) hasElementChild = true;
                  else if (
                    n.nodeType === 3 &&
                    n.nodeValue.match(/[^ \f\n\r\t\v]/)
                  )
                    textChild++;
                  // non-whitespace text
                  else if (n.nodeType === 4) cdataChild++; // cdata section node
                }
                if (hasElementChild) {
                  if (textChild < 2 && cdataChild < 2) {
                    // structured element with evtl. a single text or/and cdata node ..
                    X.removeWhite(xml);
                    for (var n = xml.firstChild; n; n = n.nextSibling) {
                      if (n.nodeType === 3)
                        // text node
                        o["#text"] = X.escape(n.nodeValue);
                      else if (n.nodeType === 4)
                        // cdata node
                        o["#cdata"] = X.escape(n.nodeValue);
                      else if (o[n.nodeName]) {
                        // multiple occurence of element ..
                        if (o[n.nodeName] instanceof Array)
                          o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                        else o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                      } // first occurence of element..
                      else o[n.nodeName] = X.toObj(n);
                    }
                  } else {
                    // mixed content
                    if (!xml.attributes.length) o = X.escape(X.innerXml(xml));
                    else o["#text"] = X.escape(X.innerXml(xml));
                  }
                } else if (textChild) {
                  // pure text
                  if (!xml.attributes.length) o = X.escape(X.innerXml(xml));
                  else o["#text"] = X.escape(X.innerXml(xml));
                } else if (cdataChild) {
                  // cdata
                  if (cdataChild > 1) o = X.escape(X.innerXml(xml));
                  else
                    for (var n = xml.firstChild; n; n = n.nextSibling)
                      o["#cdata"] = X.escape(n.nodeValue);
                }
              }
              if (!xml.attributes.length && !xml.firstChild) o = null;
            } else if (xml.nodeType === 9) {
              // document.node
              o = X.toObj(xml.documentElement);
            } else console.log("unhandled node type: " + xml.nodeType);
            return o;
          },
          toJson: function (o: any, name: any, ind: any) {
            var json = name ? '"' + name + '"' : "";
            if (o instanceof Array) {
              for (var i = 0, n = o.length; i < n; i++)
                o[i] = X.toJson(o[i], "", ind + "\t");
              json +=
                (name ? ":[" : "[") +
                (o.length > 1
                  ? "\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind
                  : o.join("")) +
                "]";
            } else if (o === null) json += (name && ":") + "null";
            else if (typeof o == "object") {
              let arr: any[] = [];
              for (var m in o) arr[arr.length] = X.toJson(o[m], m, ind + "\t");
              json +=
                (name ? ":{" : "{") +
                (arr.length > 1
                  ? "\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind
                  : arr.join("")) +
                "}";
            } else if (typeof o === "string")
              json += (name && ":") + '"' + o.toString() + '"';
            else json += (name && ":") + o.toString();
            return json;
          },
          innerXml: function (node: any) {
            var s = "";
            if ("innerHTML" in node) s = node.innerHTML;
            else {
              var asXml = function (n: any) {
                var s = "";
                if (n.nodeType === 1) {
                  s += "<" + n.nodeName;
                  for (var i = 0; i < n.attributes.length; i++)
                    s +=
                      " " +
                      n.attributes[i].nodeName +
                      '="' +
                      (n.attributes[i].nodeValue || "").toString() +
                      '"';
                  if (n.firstChild) {
                    s += ">";
                    for (var c = n.firstChild; c; c = c.nextSibling)
                      s += asXml(c);
                    s += "</" + n.nodeName + ">";
                  } else s += "/>";
                } else if (n.nodeType === 3) s += n.nodeValue;
                else if (n.nodeType === 4) s += "<![CDATA[" + n.nodeValue + "]]>";
                return s;
              };
              for (var c = node.firstChild; c; c = c.nextSibling) s += asXml(c);
            }
            return s;
          },
          escape: function (txt: any) {
            return txt
              .replace(/[\\]/g, "\\\\")
              .replace(/[\"]/g, '\\"')
              .replace(/[\n]/g, "\\n")
              .replace(/[\r]/g, "\\r");
          },
          removeWhite: function (e: any) {
            e.normalize();
            for (var n = e.firstChild; n; ) {
              if (n.nodeType === 3) {
                // text node
                if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
                  // pure whitespace text node
                  var nxt = n.nextSibling;
                  e.removeChild(n);
                  n = nxt;
                } else n = n.nextSibling;
              } else if (n.nodeType === 1) {
                // element node
                X.removeWhite(n);
                n = n.nextSibling;
              } // any other node
              else n = n.nextSibling;
            }
            return e;
          },
        };
        if (xml.nodeType === 9)
          // document node
          xml = xml.documentElement;
        var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
        return (
          "{\n" +
          tab +
          (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) +
          "\n}"
        );
      }

      parseXml(xml: any) {
        let dom: any = null;
        if (window?.DOMParser) {
          try {
            dom = new DOMParser().parseFromString(xml, "text/xml");
          } catch (e) {
            dom = null;
          }
        } else alert("cannot parse xml string!");
        return dom;
      }

  useEffect(() => {
    

    function 

   

    // textData(
    //   "https://raw.githubusercontent.com/CS-21-07/jsonStorage/main/memData.xml"
    // ).then((res) => {
    //   console.log(res);
    //   let dom = parseXml(res);
    //   let result = xml2json(dom, { compact: false, spaces: 4 });
    //   console.log("completed");
    //   setJson(result);
    //   console.log(json);
    // });

    const xmlval =
      '<span class="vevent">  <a class="url" href="http://www.web2con.com/">    <span class="summary">Web 2.0 Conference</span>    <abbr class="dtstart" title="2005-10-05">October 5</abbr>    <abbr class="dtend" title="2005-10-08">7</abbr>    <span class="location">Argent Hotel, San Francisco, CA</span>  </a></span>';
    // let xmlval = '<e name="value">text</e>';
    setxml(xmlval);
    let dom = parseXml(xmlval);
    setJson(xml2json(dom, "\t"));

    console.log(xml2json(dom, "\t"));
  }, []);

  async componentDidMount() {

    var self = this;
	axios
	.get("https://raw.githubusercontent.com/CS-21-07/jsonStorage/main/memData.xml", {
		"Content-Type": "application/xml; charset=utf-8"
	 })
	.then(function(response) {
		self.setState({ authors: response.data });
	})
	.catch(function(error) {
		console.log(error);
	});
}

    async function textData(toFetchPath: string): Promise<any[]> {
        const response = await fetch(toFetchPath)
          .then(function (response: any) {
            console.log("Successful fetch at " + toFetchPath);
            return response.text();
          })
          .catch((err) => {
            console.log("There was an error in fetching", err);
          });
        return Promise.resolve(response);
      }


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
    return (
        <div>

        </div>
    )
  }
}

export default Converter;
