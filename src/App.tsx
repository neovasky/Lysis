/**
 * File: src/App.tsx
 * Description: Main application component handling routing and theme
 */

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme/theme";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { GlossaryPage } from "./pages/Glossary/GlossaryPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<div>Dashboard Content</div>} />
            <Route path="glossary" element={<GlossaryPage />} />
            <Route path="alerts" element={<div>Alerts Content</div>} />
            <Route path="files" element={<div>Files Content</div>} />
            <Route path="calendar" element={<div>Calendar Content</div>} />
            <Route path="notes" element={<div>Research Notes Content</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
