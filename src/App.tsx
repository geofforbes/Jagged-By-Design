import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { TimelinePage } from "./pages/TimelinePage";
import { CareCoPage } from "./pages/CareCoPage";
import { MemoriesPage } from "./pages/MemoriesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { CalendarPage } from "./pages/CalendarPage";
import { ClinicalReportPage } from "./pages/ClinicalReportPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<TimelinePage />} />
        <Route path="care-co" element={<CareCoPage />} />
        <Route path="memories" element={<MemoriesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="report" element={<ClinicalReportPage />} />
      </Route>
    </Routes>
  );
}

export default App;
