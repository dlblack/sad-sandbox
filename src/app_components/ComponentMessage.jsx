import React, { useEffect, useRef } from "react";

export default function ComponentMessage({ messages = [] }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
      <div className="component-messages">
        {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.type || "info"}`}>
              {msg.text}
            </div>
        ))}
        <div ref={bottomRef} />
      </div>
  );
}
