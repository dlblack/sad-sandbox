import React, { createContext, useState, useEffect } from "react";

export const StyleContext = createContext();

export const StyleProvider = ({ children }) => {
  // Retrieve saved styles from localStorage or use defaults
  const getDefaultStyle = (key, defaultValue) =>
    localStorage.getItem(key) || defaultValue;

  const [modalStyle, setModalStyle] = useState(getDefaultStyle("modalStyle", "bg-secondary text-white"));
  const [navbarStyle, setNavbarStyle] = useState(getDefaultStyle("navbarStyle", "bg-primary navbar-dark"));
  const [appBackgroundStyle, setAppBackgroundStyle] = useState(getDefaultStyle("appBackgroundStyle", "bg-light"));

  // Update localStorage whenever styles change
  useEffect(() => {
    localStorage.setItem("modalStyle", modalStyle);
  }, [modalStyle]);

  useEffect(() => {
    localStorage.setItem("navbarStyle", navbarStyle);
  }, [navbarStyle]);

  useEffect(() => {
    localStorage.setItem("appBackgroundStyle", appBackgroundStyle);
  }, [appBackgroundStyle]);

  const toggleModalStyle = (newStyle) => setModalStyle(newStyle);
  const toggleNavbarStyle = (newStyle) => setNavbarStyle(newStyle);
  const toggleAppBackgroundStyle = (newStyle) => setAppBackgroundStyle(newStyle);

  return (
    <StyleContext.Provider
      value={{
        modalStyle,
        navbarStyle,
        appBackgroundStyle,
        toggleModalStyle,
        toggleNavbarStyle,
        toggleAppBackgroundStyle,
      }}
    >
      {children}
    </StyleContext.Provider>
  );
};
