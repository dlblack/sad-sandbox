import React, {createContext, useEffect, useState} from "react";

export const StyleContext = createContext();

export const StyleProvider = ({children}) => {
  // Retrieve saved styles from localStorage or use defaults
  const getDefaultStyle = (key, defaultValue) =>
    localStorage.getItem(key) || defaultValue;

  const [appBackgroundStyle, setAppBackgroundStyle] = useState(getDefaultStyle("appBackgroundStyle", "bg-light"));
  const [navbarStyle, setNavbarStyle] = useState(getDefaultStyle("navbarStyle", "bg-primary navbar-dark"));
  const [componentHeaderStyle, setComponentHeaderStyle] = useState(getDefaultStyle("componentHeaderStyle", "bg-secondary text-white"));
  const [componentBackgroundStyle, setComponentBackgroundStyle] = useState(getDefaultStyle("componentBackgroundStyle", "bg-light"));

  // Update localStorage whenever styles change
  useEffect(() => {
    localStorage.setItem("appBackgroundStyle", appBackgroundStyle);
  }, [appBackgroundStyle]);

  useEffect(() => {
    localStorage.setItem("navbarStyle", navbarStyle);
  }, [navbarStyle]);

  useEffect(() => {
    localStorage.setItem("componentHeaderStyle", componentHeaderStyle);
  }, [componentHeaderStyle]);

  useEffect(() => {
    localStorage.setItem("componentBackgroundStyle", componentBackgroundStyle);
  }, [componentBackgroundStyle]);

  const toggleAppBackgroundStyle = (newStyle) => setAppBackgroundStyle(newStyle);
  const toggleNavbarStyle = (newStyle) => setNavbarStyle(newStyle);
  const toggleComponentHeaderStyle = (newStyle) => setComponentHeaderStyle(newStyle);
  const toggleComponentBackgroundStyle = (newStyle) => setComponentBackgroundStyle(newStyle);

  return (
    <StyleContext.Provider
      value={{
        appBackgroundStyle,
        navbarStyle,
        componentHeaderStyle,
        componentBackgroundStyle,
        toggleAppBackgroundStyle,
        toggleNavbarStyle,
        toggleComponentHeaderStyle,
        toggleComponentBackgroundStyle,
      }}
    >
      {children}
    </StyleContext.Provider>
  );
};
