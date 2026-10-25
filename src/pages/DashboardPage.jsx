import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  BriefcaseBusiness,
  Users,
  FileText,
  ArrowUpRight,
  PlusCircle,
  Activity,
  Layers,
} from "lucide-react";
import { pb } from "../lib/pocketbase";
import "./DashboardPage.css";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    portfolios: 0,
    projects: 0,
    clients: 0,
    invoices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        const [portfolioList, projectList, clientList, invoiceList] =
          await Promise.allSettled([
            pb.collection("portfolios").getFullList({ fields: "id" }),
            pb.collection("projects").getFullList({ fields: "id" }),
            pb.collection("clients").getFullList({ fields: "id" }),
            pb.collection("invoices").getFullList({ fields: "id" }),
          ]);

        if (active) {
          setStats({
            portfolios:
              portfolioList.status === "fulfilled"
                ? portfolioList.value.length
                : 0,
            projects:
              projectList.status === "fulfilled"
                ? projectList.value.length
                : 0,
            clients:
              clientList.status === "fulfilled"
                ? clientList.value.length
                : 0,
            invoices:
              invoiceList.status === "fulfilled"
                ? invoiceList.value.length
                : 0,
          });
        }
      } catch (err) {
        console.error("Gagal memuat ringkasan dashboard:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <div className="page-heading">
        <span className="eyebrow">RINGKASAN BISNIS</span>
        <h1>Dashboard ASTERX TECH</h1>
        <p className="muted">
          Pusat kendali operasional, manajemen portofolio, dan proyek klien
          ASTERX TECH.
        </p>
      </div>

      {/* 4 Kartu Metrik Real-Time */}
      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Portofolio</span>
            <div className="stat-icon-wrapper">
              <BriefcaseBusiness size={18} />
            </div>
          </div>
          <div className="stat-number">
            {loading ? "..." : stats.portfolios}
          </div>
          <span className="stat-footer-note">Tayang di Homepage</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Proyek Website</span>
            <div className="stat-icon-wrapper">
              <FolderKanban size={18} />
            </div>
          </div>
          <div className="stat-number">
            {loading ? "..." : stats.projects}
          </div>
          <span className="stat-footer-note">Semua status proyek</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Klien</span>
            <div className="stat-icon-wrapper">
              <Users size={18} />
            </div>
          </div>
          <div className="stat-number">
            {loading ? "..." : stats.clients}
          </div>
          <span className="stat-footer-note">Database relasi klien</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Invoice</span>
            <div className="stat-icon-wrapper">
              <FileText size={18} />
            </div>
          </div>
          <div className="stat-number">
            {loading ? "..." : stats.invoices}
          </div>
          <span className="stat-footer-note">Faktur tagihan dibuat</span>
        </div>
      </div>

      {/* Akses Cepat Modul Utama */}
      <div className="dashboard-actions-section">
        <h2>Aksi Cepat & Navigasi Modul</h2>
        <div className="actions-card-grid">
          <Link to="/admin/portfolios" className="action-quick-card">
            <div className="action-card-header">
              <div className="action-icon-pill">
                <PlusCircle size={20} />
              </div>
              <ArrowUpRight size={18} className="action-arrow" />
            </div>
            <h3>Kelola Portofolio Website</h3>
            <p>
              Tambah karya baru, upload mockup cover, tentukan kategori, dan
              publikasikan langsung ke homepage.
            </p>
          </Link>

          <Link to="/admin/projects" className="action-quick-card">
            <div className="action-card-header">
              <div className="action-icon-pill">
                <FolderKanban size={20} />
              </div>
              <ArrowUpRight size={18} className="action-arrow" />
            </div>
            <h3>Manajemen Proyek Klien</h3>
            <p>
              Pantau tahapan pengerjaan (planning, coding, review), nominal
              kontrak, termin DP, dan tenggat waktu (deadline).
            </p>
          </Link>

          <Link to="/admin/customers" className="action-quick-card">
            <div className="action-card-header">
              <div className="action-icon-pill">
                <Users size={20} />
              </div>
              <ArrowUpRight size={18} className="action-arrow" />
            </div>
            <h3>Direktori Klien</h3>
            <p>
              Catat nomor WhatsApp, nama instansi/perusahaan, dan status prospek
              calon klien.
            </p>
          </Link>

          <Link to="/admin/invoices" className="action-quick-card">
            <div className="action-card-header">
              <div className="action-icon-pill">
                <FileText size={20} />
              </div>
              <ArrowUpRight size={18} className="action-arrow" />
            </div>
            <h3>Tagihan & Faktur (Invoices)</h3>
            <p>
              Cetak dan kelola dokumen invoice resmi DP dan pelunasan untuk
              diserahkan ke klien.
            </p>
          </Link>

          <Link to="/admin/reports" className="action-quick-card">
            <div className="action-card-header">
              <div className="action-icon-pill">
                <Activity size={20} />
              </div>
              <ArrowUpRight size={18} className="action-arrow" />
            </div>
            <h3>Laporan Keuangan</h3>
            <p>
              Pantau arus kas masuk dari proyek serta pengeluaran operasional
              ASTERX TECH secara transparan.
            </p>
          </Link>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="action-quick-card"
          >
            <div className="action-card-header">
              <div className="action-icon-pill">
                <Layers size={20} />
              </div>
              <ArrowUpRight size={18} className="action-arrow" />
            </div>
            <h3>Lihat Live Website ASTERX TECH</h3>
            <p>
              Buka tampilan depan website publik di tab baru untuk mengecek
              hasil perubahan dan portofolio terkini.
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
