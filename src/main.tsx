import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { RoleProvider } from "./context/RoleContext";
import { EntriesProvider } from "./context/EntriesContext";
import { CalendarProvider } from "./context/CalendarContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <RoleProvider>
        <EntriesProvider>
          <CalendarProvider>
            <App />
          </CalendarProvider>
        </EntriesProvider>
      </RoleProvider>
    </BrowserRouter>
  </StrictMode>,
);
