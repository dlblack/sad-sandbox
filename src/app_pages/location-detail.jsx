import useAPI from "../app_hooks/useAPI";
import Loader from "../app_components/loader";
import Map from "../app_components/map";
import TimeseriesChartContainer from "../app_components/timeseries-chart-container";

const displayAttributes = [
  {
    label: "Name",
    key: "public-name",
  },
  {
    label: "Desc.",
    key: "description",
  },
  {
    label: "Time Zone",
    key: "timezone-name",
  },
  {
    label: "Vertical Datum",
    key: "verticle-datum",
  },
];

function LocationDetail({ params }) {
  const name = params.name;

  const location = useAPI(`locations/${name}`, {
    office: "SPK",
  });

  if (Array.isArray(location)) return <Loader />;

  return (
    <div className="container pb-4">
      <div className="row">
        <div className="col">
          <div className="card text-white bg-dark mt-3 mb-3">
            <div className="cardBody">
              {displayAttributes.map((attr) => {
                return (
                  <div key={attr.label} className="row">
                    <div className="col-4">{attr.label}</div>
                    <div className="col-8">{location[attr.key]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="col">
          <div className="mt-3">
            <Map lon={location.longitude} lat={location.latitude} />
          </div>
        </div>
      </div>
      <hr />
      <div className="row">
        <TimeseriesChartContainer location={location} />
      </div>
    </div>
  );
}

export default LocationDetail;
