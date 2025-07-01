import React, { useEffect, useRef } from "react";

export default function ComponentMessage({ messages = [] }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="component-messages">
      {messages.map((msg, idx) => (
        <div key={idx} className={`message-row ${msg.type}`}>
          <span className="message-text">{msg.text}</span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
