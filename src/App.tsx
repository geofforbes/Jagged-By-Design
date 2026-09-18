import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { TimelinePage } from "./pages/TimelinePage";
import { AskPage } from "./pages/AskPage";
import { BeforeIVisitPage } from "./pages/BeforeIVisitPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="ask" element={<AskPage />} />
        <Route path="before-i-visit" element={<BeforeIVisitPage />} />
      </Route>
    </Routes>
  );
}

export default App;
