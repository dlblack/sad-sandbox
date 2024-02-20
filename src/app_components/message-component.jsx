import React from "react";

function MessageComponent() {
  return (
    <div className="message-container message-align-left">
      {" "}
      <div className="note">
        Note: Nullam quis risus eget{" "}
        <a href="#" className="note-link">
          urna mollis ornare
        </a>{" "}
        vel eu leo. Cum sociis natoque penatibus et magnis dis parturient
        montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies
        vehicula.
      </div>
      <div className="note">
        Note:{" "}
        <small>This line of text is meant to be treated as fine print.</small>
      </div>
      <div className="warning">
        Warning: The following is <strong>rendered as bold text</strong>.
      </div>
      <div className="error">
        Error: The following is <em>rendered as italicized text</em>.
      </div>
      <div className="note">
        Note: An abbreviation of the word attribute is{" "}
        <abbr title="attribute">attr</abbr>.
      </div>
    </div>
  );
}

export default MessageComponent;
