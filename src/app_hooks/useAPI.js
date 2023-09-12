import { useState, useEffect } from "react";

const apiRoot = "https://cwms-data.usace.army.mil/cwms-data/";

function useAPI(endpoint, params) {
  const [results, setResults] = useState([]);

  const paramList = Object.keys(params)
    .map((key) => {
      return `${key}=${params[key]}`;
    })
    .join("&");

  useEffect(() => {
    const url = `${apiRoot}${endpoint}?${paramList}`;

    fetch(url, {
      method: "GET",
      headers: { Accept: "application/json;version=2;" },
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        setResults(json);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [endpoint, paramList]);

  return results;
}

export default useAPI;
