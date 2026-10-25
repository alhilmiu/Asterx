import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CalendarPage from "./pages/CalendarPage";
import ProjectsPage from "./pages/ProjectsPage";
import ClientsPage from "./pages/ClientsPage";
import PaymentsPage from "./pages/PaymentsPage";
import InvoicesPage from "./pages/InvoicesPage";
import VendorsPage from "./pages/VendorsPage";
import TrackingPage from "./pages/TrackingPage";
import ReportsPage from "./pages/ReportsPage";
import OperationalExpensesPage from "./pages/OperationalExpensesPage";
import PortfoliosPage from "./pages/PortfoliosPage";
import OrderTrackingAdminPage from "./pages/OrderTrackingAdminPage";

// Digital Invitations Pages
import InvitationsCatalogPage from "./pages/InvitationsCatalogPage";
import InvitationEditorPage from "./pages/InvitationEditorPage";
import PublicInvitationPage from "./pages/PublicInvitationPage";
import AdminInvitationsPage from "./pages/AdminInvitationsPage";

import "./index.css";

function PlaceholderPage({ title }) {
  return (
    <div className="page-heading">
      <span className="eyebrow">MANAJEMEN BISNIS</span>
      <h1>{title}</h1>
      <p className="muted">Fitur ini akan dikembangkan pada tahap berikutnya.</p>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Public Order Tracking */}
      <Route path="/tracking/:token" element={<TrackingPage />} />

      {/* Public Digital Invitations Routes */}
      <Route path="/invitations" element={<InvitationsCatalogPage />} />
      <Route path="/invitations/editor" element={<InvitationEditorPage />} />
      <Route path="/invitations/editor/:id" element={<InvitationEditorPage />} />
      <Route path="/i/:slug" element={<PublicInvitationPage />} />

      <Route path="/unauthorized" element={<PlaceholderPage title="Akses tidak diizinkan" />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />

          <Route element={<ProtectedRoute allowedRoles={["owner", "manager", "admin"]} />}>
            <Route path="calendar" element={<CalendarPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["owner", "manager"]} />}>
            <Route path="invitations" element={<AdminInvitationsPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="order-tracking" element={<OrderTrackingAdminPage />} />
            <Route path="customers" element={<ClientsPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="operational-expenses" element={<OperationalExpensesPage />} />
            <Route path="portfolios" element={<PortfoliosPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
            <Route path="settings" element={<PlaceholderPage title="Pengaturan" />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<PlaceholderPage title="Halaman tidak ditemukan" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
