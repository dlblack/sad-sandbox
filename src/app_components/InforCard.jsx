const themes = {
  primary: "text-white bg-primary",
  info: "text-white bg-secondary",
  warning: "text-white bg-warning",
};

function InfoCard({ headText, cardTitle, cardText, theme }) {
  return (
    <div className={`card ${themes[theme]} mb-3`} style={{ maxWidth: "20rem" }}>
      <div className="card-header">{headText}</div>
      <div className="card-body">
        <h4 className="card-title">{cardTitle}</h4>
        <p className="card-text">{cardText}</p>
      </div>
    </div>
  );
}

export default InfoCard;
