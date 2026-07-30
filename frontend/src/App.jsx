import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./context/AppContext";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import RepositoriesPage from "./pages/RepositoriesPage";
import AnalysisPage from "./pages/AnalysisPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ContributorsPage from "./pages/ContributorsPage";
import AiAssistantPage from "./pages/AiAssistantPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

const toastStyle = {
  style: {
    background: "#1e293b",
    color: "#f1f5f9",
    border: "1px solid #334155",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
  },
  success: { iconTheme: { primary: "#10b981", secondary: "#1e293b" } },
  error: { iconTheme: { primary: "#ef4444", secondary: "#1e293b" } },
  loading: { iconTheme: { primary: "#6366f1", secondary: "#1e293b" } },
};

function App() {
  return (
    <AppProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{ duration: 4000, ...toastStyle }}
        />
        <Routes>
          <Route
            path="/*"
            element={
              <MainLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/repositories" element={<RepositoriesPage />} />
                  <Route path="/analysis/:id" element={<AnalysisPage />} />
                  <Route path="/dashboard/:id" element={<DashboardPage />} />
                  <Route
                    path="/dashboard/:id/analytics"
                    element={<AnalyticsPage />}
                  />
                  <Route
                    path="/dashboard/:id/contributors"
                    element={<ContributorsPage />}
                  />
                  <Route
                    path="/dashboard/:id/ai"
                    element={<AiAssistantPage />}
                  />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </MainLayout>
            }
          />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
