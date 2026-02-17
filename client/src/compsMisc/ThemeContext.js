import { createContext, useContext, useState, useEffect } from "react";
import { lightTheme, darkTheme } from "../styles/colors";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setMode(saved);
  }, []);

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("theme", newMode);
  };

  const theme = mode === "light" ? lightTheme : darkTheme;

  /* 
  This component creates a “theme environment” for its children (app)

  current mode and theme are kept in state (mode) and (theme) respectively

  children can access the theme using useTheme()

  When toggleTheme is called, the state updates and all components re-render with the new theme
 */

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);