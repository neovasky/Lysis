/**
 * File: src/App.tsx
 * Description: Main application component with routing configuration
 */

import { ThemeProvider } from "@mui/material";
import { theme } from "./theme/theme";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "./pages/Home/HomePage";
import { GlossaryPage } from "./pages/Glossary/GlossaryPage";
import { SettingsPage } from "./pages/Settings/SettingsPage";
import { ProfilePage } from "./pages/Profile";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/glossary" element={<GlossaryPage />} />
            <Route path="/alerts" element={<div>Alerts Page</div>} />
            <Route path="/files" element={<div>Files Page</div>} />
            <Route path="/calendar" element={<div>Calendar Page</div>} />
            <Route path="/notes" element={<div>Research Notes Page</div>} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
