import InfoCard from "../app_components/info-card";
import LocationList from "../app_components/location-list";

function Home() {
  return (
    <div className="container pt-4">
      <h2>Sacramento District</h2>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </p>
      <div className="row">
        <div className="col">
          <InfoCard
            theme="primary"
            headText="One"
            cardTitle="This is the first title"
            cardText="First box card text"
          />
        </div>
        <div className="col">
          <InfoCard
            theme="info"
            headText="Two"
            cardTitle="This is the second title"
            cardText="Second box card text"
          />
        </div>

        <div className="col">
          <InfoCard
            theme="warning"
            headText="Three"
            cardTitle="This is the third title"
            cardText="Third box card text"
          />
        </div>
      </div>
      {/* END ROW */}
      <hr />
      <LocationList />
    </div>
  );
}

export default Home;
