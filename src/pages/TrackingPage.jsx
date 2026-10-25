import { useParams } from "react-router-dom";
import { pb } from "../lib/pocketbase";
import { useEffect, useRef, useState } from "react";

function formatDate(value) {
  if (!value) return "Belum ditentukan";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Belum ditentukan";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const statusLabels = {
  planning: "Persiapan",
  in_progress: "Sedang Dikerjakan",
  review: "Dalam Pemeriksaan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export default function TrackingPage() {
  const { token } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dataRef = useRef(null);

useEffect(() => {
  dataRef.current = data;
}, [data]);
  
useEffect(() => {
  let cancelled = false;
  let isFirstLoad = true;
  let intervalId;

  async function loadTracking() {
    try {
      if (!token || token.length < 32) {
        throw new Error("Link tracking tidak valid.");
      }

      const result = await pb.send(
        `/api/trimi/tracking/${encodeURIComponent(token)}`,
        {
          method: "GET",
          requestKey: null,
        }
      );

      if (!result?.success || !result?.project) {
        throw new Error("Data tracking tidak tersedia.");
      }

      if (!cancelled) {
        setData(result);
        setError("");
      }
    } catch (err) {
      if (cancelled) return;

      // Abaikan request yang memang dibatalkan.
      if (
        err?.name === "AbortError" ||
        err?.status === 0
      ) {
        console.warn("Request tracking dibatalkan:", err);
        return;
      }

      console.error("Gagal memuat tracking:", err);

      // Pertahankan data lama jika pembaruan berkala gagal.
      if (isFirstLoad || !dataRef.current) {
        setError(
          err?.response?.message ||
            err?.message ||
            "Link tracking tidak ditemukan, belum aktif, atau sudah tidak berlaku."
        );
      }
    } finally {
      if (!cancelled && isFirstLoad) {
        setLoading(false);
        isFirstLoad = false;
      }
    }
  }

  setLoading(true);
  loadTracking();

  intervalId = setInterval(() => {
    loadTracking();
  }, 15000);

  return () => {
    cancelled = true;
    clearInterval(intervalId);
  };
}, [token]);


  if (loading) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <p style={styles.muted}>Memuat informasi proyek...</p>
        </section>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <div style={styles.brand}>TriMi</div>
          <h1 style={styles.heading}>Tracking Pesanan</h1>
          <p style={styles.error}>{error || "Data tracking tidak tersedia."}</p>
          <p style={styles.muted}>
            Pastikan link yang Anda terima benar. Jika masalah berlanjut,
            silakan hubungi pihak yang menangani pesanan Anda.
          </p>
        </section>
      </main>
    );
  }

  const project = data.project;
  const updates = Array.isArray(data.updates) ? data.updates : [];

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.brand}>TriMi</div>
          <p style={styles.tagline}>Truly Made for You</p>
          <h1 style={styles.heading}>Tracking Pesanan</h1>
          <p style={styles.muted}>
            Pantau perkembangan proyek Anda melalui halaman ini.
          </p>
        </header>

        <section style={styles.card}>
          <p style={styles.label}>Nomor Invoice</p>
          <h2 style={styles.invoice}>
            {data.invoice?.invoiceNumber || "—"}
          </h2>

          <div style={styles.divider} />

          <p style={styles.label}>Nama Proyek</p>
          <h2 style={styles.projectName}>
            {project.name || "Proyek Anda"}
          </h2>

          <div style={styles.progressSummary}>
            <div style={styles.progressMeta}>
              <span style={styles.label}>Progres Proyek</span>
              <strong style={styles.progressValue}>{Math.max(0, Math.min(100, Number(project.progressPercent || 0)))}%</strong>
            </div>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressFill, width: `${Math.max(0, Math.min(100, Number(project.progressPercent || 0)))}%` }} />
            </div>
            <div style={styles.progressMeta}>
              <span style={styles.mutedSmall}>Tahapan selesai</span>
              <span style={styles.mutedSmall}>{updates.filter((item) => item.status === "completed").length} dari {updates.length} tahapan</span>
            </div>
          </div>

          <div style={styles.statusRow}>
            <span style={styles.label}>Status Proyek</span>
            <span style={styles.status}>
              {statusLabels[project.status] || project.status || "Belum tersedia"}
            </span>
          </div>

          <div style={styles.dateGrid}>
            <div>
              <p style={styles.label}>Tanggal Mulai</p>
              <strong>{formatDate(project.startDate)}</strong>
            </div>

            <div>
              <p style={styles.label}>Target Selesai</p>
              <strong>{formatDate(project.deadline)}</strong>
            </div>

            {project.completionDate && (
              <div>
                <p style={styles.label}>Tanggal Selesai</p>
                <strong>{formatDate(project.completionDate)}</strong>
              </div>
            )}
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Tahapan Pengerjaan</h2>
          <p style={styles.mutedSmall}>Informasi ini diperbarui oleh tim TriMi sesuai perkembangan proyek.</p>

          {updates.length === 0 ? (
            <p style={styles.muted}>
              Belum ada pembaruan yang ditampilkan. Silakan periksa kembali
              nanti.
            </p>
          ) : (
            <div style={styles.timeline}>
              {updates.map((update, index) => (
                <article
                  key={`${update.date}-${index}`}
                  style={styles.update}
                >
                  <div style={{ ...styles.timelineDot, ...(update.status === "completed" ? styles.timelineDotDone : update.status === "in_progress" ? styles.timelineDotActive : {}) }} />

                  <div>
                    <div style={styles.updateMetaRow}>
                      <span style={styles.stepNumber}>{String(update.sortOrder || index + 1).padStart(2, "0")}</span>
                      <p style={styles.updateDate}>{update.status === "in_progress" ? "Sedang Dikerjakan" : formatDate(update.date)}</p>
                    </div>

                    <h3 style={styles.updateTitle}>
                      {update.title}
                    </h3>

                    <p style={styles.message}>
                      {update.message}
                    </p>

                    {update.status && (
                      <span style={styles.status}>
                        {statusLabels[update.status] || update.status}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer style={styles.footer}>
          TriMi · Truly Made for You
        </footer>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 16px",
    background: "#f4f6fa",
    color: "#1e293b",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "760px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "24px",
  },
  brand: {
    color: "#172554",
    fontSize: "25px",
    fontWeight: 800,
    letterSpacing: "1px",
  },
  tagline: {
    margin: "6px 0 20px",
    color: "#64748b",
    fontSize: "13px",
  },
  heading: {
    margin: "0 0 8px",
    fontSize: "27px",
    color: "#172554",
  },
  muted: {
    color: "#64748b",
    lineHeight: 1.7,
    fontSize: "14px",
  },
  card: {
    padding: "24px",
    marginBottom: "18px",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    background: "#ffffff",
    boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
  },
  label: {
    margin: "0 0 7px",
    color: "#64748b",
    fontSize: "12px",
  },
  invoice: {
    margin: 0,
    fontSize: "20px",
    overflowWrap: "anywhere",
  },
  projectName: {
    margin: "0 0 22px",
    fontSize: "21px",
    color: "#172554",
  },
  divider: {
    height: "1px",
    background: "#e2e8f0",
    margin: "20px 0",
  },
  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "22px",
  },
  status: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    background: "#eef2ff",
    color: "#3730a3",
    fontSize: "12px",
    fontWeight: 700,
  },
  dateGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
  },
  progressSummary: {
    margin: "0 0 22px",
    padding: "16px",
    border: "1px solid #e5eadf",
    borderRadius: "10px",
    background: "#fbfdf9",
  },
  progressMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "8px",
  },
  progressValue: { color: "#172554", fontSize: "18px" },
  progressTrack: { height: "7px", background: "#e2e8d9", borderRadius: "99px", overflow: "hidden", margin: "8px 0 10px" },
  progressFill: { height: "100%", background: "#172554", borderRadius: "99px", transition: "width 250ms ease" },
  mutedSmall: { color: "#64748b", fontSize: "12px", lineHeight: 1.6 },
  updateMetaRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "7px" },
  stepNumber: { display: "inline-grid", placeItems: "center", width: "26px", height: "26px", borderRadius: "50%", background: "#f1f5f0", color: "#64748b", fontSize: "10px", fontWeight: 700, flexShrink: 0 },
  timelineDotDone: { background: "#15803d", boxShadow: "0 0 0 4px #dcfce7" },
  timelineDotActive: { background: "#172554", boxShadow: "0 0 0 4px #dbeafe" },
  sectionTitle: {
    margin: "0 0 10px",
    fontSize: "19px",
    color: "#172554",
  },
  timeline: {
    display: "grid",
    gap: "24px",
  },
  update: {
    display: "grid",
    gridTemplateColumns: "12px minmax(0, 1fr)",
    gap: "12px",
  },
  timelineDot: {
    width: "10px",
    height: "10px",
    marginTop: "5px",
    borderRadius: "50%",
    background: "#172554",
  },
  updateDate: {
    margin: "0 0 6px",
    color: "#64748b",
    fontSize: "12px",
  },
  updateTitle: {
    margin: "0 0 8px",
    fontSize: "16px",
  },
  message: {
    margin: "0 0 10px",
    color: "#475569",
    lineHeight: 1.7,
    fontSize: "14px",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  error: {
    color: "#b91c1c",
    background: "#fef2f2",
    padding: "12px",
    borderRadius: "8px",
    lineHeight: 1.6,
  },
  footer: {
    padding: "14px 0",
    color: "#94a3b8",
    fontSize: "12px",
    textAlign: "center",
  },
};