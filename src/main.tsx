import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

// Initialize saved theme
if (typeof window !== "undefined" && localStorage.getItem("kt_theme") === "light") {
  document.body.classList.add("light-theme");
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);