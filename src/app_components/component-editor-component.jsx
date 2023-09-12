import React from "react";

function ComponentEditorComponent() {
  return (
    <div
      className="card text-white bg-primary mb-3"
      style={{ width: "100%", height: "100%" }}
    >
      <div className="card-header">Project Name:</div>
      <div
        className="card-body"
        style={{
          paddingLeft: "10px",
          paddingRight: "10px",
          paddingBottom: "10px",
          maxHeight: "calc(100% - 40px)",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        <form className="card-text">
          <div className="form-group">
            <label
              className="col-form-label col-form-label-sm"
              htmlFor="inputSmall"
            >
              Field 1:
            </label>
            <input
              className="form-control form-control-sm"
              type="text"
              placeholder="Placeholder"
              id="inputSmall"
            />
            <hr />
          </div>
          <div className="form-group">
            <label
              className="col-form-label col-form-label-sm"
              htmlFor="inputSmall"
            >
              Field 2:
            </label>
            <input
              className="form-control form-control-sm"
              type="text"
              placeholder="Placeholder"
              id="inputSmall"
            />
            <hr />
          </div>
          <div className="form-group">
            <label
              className="col-form-label col-form-label-sm"
              htmlFor="inputSmall"
            >
              Field 3:
            </label>
            <input
              className="form-control form-control-sm"
              type="text"
              placeholder="Placeholder"
              id="inputSmall"
            />
            <hr />
          </div>
          <div className="form-group">
            <label
              className="col-form-label col-form-label-sm"
              htmlFor="inputSmall"
            >
              Field 4:
            </label>
            <input
              className="form-control form-control-sm"
              type="text"
              placeholder="Placeholder"
              id="inputSmall"
            />
            <hr />
          </div>
          <div className="form-group">
            <label htmlFor="exampleSelect1" className="form-label">
              Combo Box 1:
            </label>
            <select className="form-select" id="exampleSelect1">
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
            </select>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComponentEditorComponent;
