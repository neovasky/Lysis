/**
 * File: src/App.tsx
 * Description: Root application component with routing and theme setup
 */

import { ThemeProvider } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "./pages/Home/HomePage";
import { GlossaryPage } from "./pages/Glossary/GlossaryPage";
import { ProfilePage } from "./pages/Profile/ProfilePage";
import { SettingsPage } from "./pages/Settings/SettingsPage";
import { AuthPage } from "./pages/Auth/AuthPage";
import { AlertsPage } from "./pages/Alerts/AlertsPage";
import { FilesPage } from "./pages/Files/FilesPage";
import { CalendarPage } from "./pages/Calendar/CalendarPage";
import { NotesPage } from "./pages/Notes/NotesPage";
import { AnalysisPage } from "./pages/Analysis/AnalysisPage";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { theme } from "./theme/theme";

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // You might want to replace this with a proper loading component
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="glossary" element={<GlossaryPage />} />
              <Route path="analysis" element={<AnalysisPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="files" element={<FilesPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
