import useAPI from "../app_hooks/useAPI";
import Loader from "./loader";
import { useState } from "react";
import TimeseriesChart from "./timeseries-chart";

function TimeseriesChartContainer({ location }) {
  const [tsChecked, setTsChecked] = useState("");

  const timeseries = useAPI("catalog/TIMESERIES", {
    like: `${location.name}.*`,
    office: location["office-id"],
  });

  if (Array.isArray(timeseries)) return <Loader />;

  const data = [];
  return (
    <>
      <div className="col-3">
        <div className="form-group">
          {timeseries.entries
            .filter((ts) => {
              return !!ts.extents.length;
            })
            .sort((a, b) => {
              if (a.name > b.name) return 1;
              if (a.name < b.name) return -1;
              return 0;
            })
            .map((ts, i) => {
              return (
                <div key={ts.name} className="form-check">
                  <label className="form-check-label">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="ts-radio"
                      id={`ts-radio-${i}`}
                      value={ts.name}
                      checked={ts.name === tsChecked}
                      onChange={(e) => {
                        setTsChecked(e.currentTarget.value);
                      }}
                    />
                    {ts.name}
                  </label>
                </div>
              );
            })}
        </div>
      </div>
      <div className="col-9">
        <TimeseriesChart tsName={tsChecked} office={location["office-id"]} />
      </div>
    </>
  );
}

export default TimeseriesChartContainer;
