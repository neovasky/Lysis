import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

// Create root element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Handle IPC messages if window.electron exists
if (window.electron) {
  window.electron.ipcRenderer.on("main-process-message", (data: unknown) => {
    if (data && Array.isArray(data) && data.length > 0) {
      console.log("Message from main process:", data[0]);
    }
  });
}
