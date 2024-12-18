import useAPI from "../app_hooks/useAPI";
import Loader from "./loader";
import { useState } from "react";

function LocationList() {
  const [searchString, setSearchString] = useState("");

  const locations = useAPI("catalog/LOCATIONS", {
    office: "SPK",
    "page-size": 1000,
  });

  if (Array.isArray(locations)) return <Loader />;

  return (
    <div>
      <input
        value={searchString}
        onChange={(e) => {
          setSearchString(e.target.value);
        }}
        className="form-control mb-3"
      ></input>
      <ul className="list-group">
        {locations.entries
          .filter((loc) => {
            const matcher = new RegExp(searchString, "ig");
            if (loc.kind === "PROJECT" && matcher.test(loc["public-name"]))
              return true;
            return false;
          })
          .map((loc, i) => {
            return (
              <a
                key={i}
                href={`/locations/${loc.name}`}
                className="list-group-item list-group-item-action"
              >
                {loc["public-name"]}
              </a>
            );
          })}
      </ul>
    </div>
  );
}

export default LocationList;
