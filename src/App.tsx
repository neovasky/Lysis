// File: src/App.tsx

import React from "react";
import { ThemeProvider } from "./theme/ThemeProvider";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "./pages/Home/HomePage";
import { GlossaryPage } from "./pages/Glossary/GlossaryPage";
import { ProfilePage } from "./pages/Profile/ProfilePage";
import { SettingsPage } from "./pages/Settings/SettingsPage";
import { AuthPage } from "./pages/Auth/AuthPage";
import { AlertsPage } from "./pages/Alerts/AlertsPage";
import FilesPage from "./pages/Files/FilesPage"; // default import for FilesPage
import { CalendarPage } from "./pages/Calendar/CalendarPage";
import { NotesPage } from "./pages/Notes/NotesPage";
import { AnalysisPage } from "./pages/Analysis/AnalysisPage";
import { AuthProvider } from "./contexts/AuthContext";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { useAuth } from "./hooks/useAuth";
import { ThemeMode, ThemeAccent } from "./theme/types";
import { TooltipProvider } from "@/components/ui/tooltip"; // important for shadcn tooltips

import "@radix-ui/themes/styles.css"; // optional if you have Radix UI themes

/**
 * ProtectedRoute:
 *   - If the user is logged in, show the children.
 *   - Otherwise, redirect to /auth.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
};

export function App() {
  // Detect initial light/dark mode from localStorage or matchMedia.
  const getInitialTheme = (): ThemeMode => {
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode | null;
    if (savedMode === "light" || savedMode === "dark") {
      return savedMode;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  // Detect initial accent color.
  const getInitialAccent = (): ThemeAccent => {
    const savedAccent = localStorage.getItem(
      "theme-accent"
    ) as ThemeAccent | null;
    return savedAccent || "slate";
  };

  return (
    <Provider store={store}>
      <ThemeProvider
        defaultMode={getInitialTheme()}
        defaultAccent={getInitialAccent()}
      >
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                {/* Public route */}
                <Route path="/auth" element={<AuthPage />} />

                {/* Protected routes */}
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

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
