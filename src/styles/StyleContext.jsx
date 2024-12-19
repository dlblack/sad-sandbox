import React, { createContext, useState } from "react";

export const StyleContext = createContext();

export const StyleProvider = ({ children }) => {
  const [style, setStyle] = useState("bg-secondary text-white");

  const toggleStyle = (newStyle) => {
    setStyle(newStyle);
  };

  return (
    <StyleContext.Provider value={{ style, toggleStyle }}>
      {children}
    </StyleContext.Provider>
  );
};
