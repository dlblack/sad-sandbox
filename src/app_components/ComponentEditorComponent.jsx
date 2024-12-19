import React, { useContext } from "react";
import { StyleContext } from "../styles/StyleContext";

function ComponentEditorComponent() {
  const { style } = useContext(StyleContext);

  return (
    <div className={`${style}`}>
      <div className="card-body">
        <form className="card-text">
          <div className="form-group">
            <label htmlFor="field1">Field 1:</label>
            <input
              className="form-control form-control-sm"
              type="text"
              placeholder="Placeholder"
              id="field1"
            />
            <hr />
          </div>
          <div className="form-group">
            <label htmlFor="field2">Field 2:</label>
            <input
              className="form-control form-control-sm"
              type="text"
              placeholder="Placeholder"
              id="field2"
            />
            <hr />
          </div>
          <div className="form-group">
            <label htmlFor="exampleSelect1">Combo Box 1:</label>
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
