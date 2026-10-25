import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  CreditCard,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Users,
  Building2,
  ChartNoAxesCombined,
  ReceiptText,
  BriefcaseBusiness,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const navigation = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/invitations", label: "Undangan Digital", icon: Sparkles },
  { to: "/admin/projects", label: "Proyek Website", icon: FolderKanban },
  { to: "/admin/order-tracking", label: "Order Tracking", icon: ListChecks },
  { to: "/admin/customers", label: "Klien", icon: Users },
  { to: "/admin/vendors", label: "Vendor", icon: Building2 },
  { to: "/admin/payments", label: "Pembayaran", icon: CreditCard },
  { to: "/admin/invoices", label: "Invoice", icon: FileText },
  {
    to: "/admin/reports",
    label: "Laporan Keuangan",
    icon: ChartNoAxesCombined,
  },
  {
    to: "/admin/operational-expenses",
    label: "Biaya Operasional",
    icon: ReceiptText,
  },
  { to: "/admin/portfolios", label: "Portfolio", icon: BriefcaseBusiness },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <strong>ASTERX TECH</strong>
            <small>DIGITAL SOLUTIONS</small>
          </div>
        </div>

        <nav className="navigation">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <strong>{user?.name || user?.email || "Pengguna"}</strong>
            <small>{user?.role || "Belum diketahui"}</small>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <strong>ASTERX TECH Admin</strong>
            <p>DIGITAL SOLUTIONS</p>
          </div>

          <span className="role-badge">{user?.role || "Pengguna"}</span>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
