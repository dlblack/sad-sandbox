export default function ComponentMessage({ messages = [] }) {
  return (
    <div className="component-messages">
      {messages.map((msg, idx) => (
        <div key={idx} className={`message-row ${msg.type}`}>
          <span className="message-text">{msg.text}</span>
        </div>
      ))}
    </div>
  );
}
