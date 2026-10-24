import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MapPage } from './pages/MapPage';
import { ReportsPage } from './pages/ReportsPage';
import { ReportWizardPage } from './pages/ReportWizardPage';
import { AlertsPage } from './pages/AlertsPage';
import { VillageDetailPage } from './pages/VillageDetailPage';
import { WaterWeatherPage } from './pages/WaterWeatherPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Standalone Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Application Inside AppShell (Navbar, Sidebar, Live WebSocket Toast, Mobile Nav) */}
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/cases" element={<ReportsPage />} />
              <Route path="/report" element={<ReportWizardPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/village/:id" element={<VillageDetailPage />} />
              <Route path="/water-weather" element={<WaterWeatherPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/about" element={<AboutPage />} />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
