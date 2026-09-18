import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { RoleProvider } from "./context/RoleContext";
import { EntriesProvider } from "./context/EntriesContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <RoleProvider>
        <EntriesProvider>
          <App />
        </EntriesProvider>
      </RoleProvider>
    </BrowserRouter>
  </StrictMode>,
);
