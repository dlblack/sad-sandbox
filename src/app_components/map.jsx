import apiKey from "../map_api";

function Map({ lon = -96, lat = 39 }) {
  const host =
    "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/static/";
  const zoom = "12";
  const pitch = "0";
  const size = "500x300";

  const url = `${host}${lon},${lat},${zoom},${pitch}/${size}?access_token=${apiKey}`;

  return <img src={url} height="300" width="500" alt="Map" />;
}

export default Map;
