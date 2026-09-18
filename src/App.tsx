import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { TimelinePage } from "./pages/TimelinePage";
import { CareCoPage } from "./pages/CareCoPage";
import { MemoriesPage } from "./pages/MemoriesPage";
import { ProfilePage } from "./pages/ProfilePage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<TimelinePage />} />
        <Route path="care-co" element={<CareCoPage />} />
        <Route path="memories" element={<MemoriesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
