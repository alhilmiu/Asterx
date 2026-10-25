import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw, Save, Search, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";
import { pb } from "../lib/pocketbase";

const statusLabels = {
  planning: "Perencanaan",
  in_progress: "Sedang Dikerjakan",
  review: "Menunggu Review",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

function clampPercent(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function OrderTrackingAdminPage() {
  const [projects, setProjects] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  

const loadProjects = useCallback(async () => {
  setLoading(true);
  setError("");

  try {
    const result = await pb.collection("projects").getList(1, 50, {
      requestKey: null,
    });

    setProjects(result.items);

    setDrafts((current) => {
      const next = {};

      for (const project of result.items) {
        next[project.id] =
          current[project.id] !== undefined
            ? current[project.id]
            : String(
                Math.max(
                  0,
                  Math.min(
                    100,
                    Number(project.progress_percent) || 0
                  )
                )
              );
      }

      return next;
    });
  } catch (err) {
    console.error("[Order Tracking] Gagal memuat proyek:", {
      status: err?.status,
      response: err?.response,
      data: err?.response?.data,
      originalError: err,
    });

    setError(
      err?.response?.message ||
        err?.message ||
        "Gagal memuat proyek dari PocketBase."
    );
  } finally {
    setLoading(false);
  }
}, []);



  useEffect(() => { loadProjects(); }, [loadProjects]);

  const filteredProjects = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return projects;
    return projects.filter((project) =>
      [project.project_name, project.project_code, project.status]
        .some((value) => String(value || "").toLowerCase().includes(keyword))
    );
  }, [projects, search]);

  async function saveProgress(project) {
    if (savingId) return;
    const progress = clampPercent(drafts[project.id] ?? project.progress_percent);
    setSavingId(project.id);
    setError("");
    setNotice("");
    try {
      const updated = await pb.collection("projects").update(project.id, { progress_percent: progress });
      setProjects((current) => current.map((item) => item.id === project.id ? updated : item));
      setDrafts((current) => ({ ...current, [project.id]: String(progress) }));
      setNotice(`Progres ${project.project_name} berhasil disimpan menjadi ${progress}%.`);
    } catch (err) {
      console.error("Gagal menyimpan progres manual:", err, err?.response);
      setError(err?.response?.message || "Progres gagal disimpan. Pastikan field progress_percent tersedia dan API Rules projects mengizinkan update.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <div>
      <div className="page-heading">
        <span className="eyebrow">MANAJEMEN PROYEK</span>
        <h1>Order Tracking</h1>
        <p className="muted">Atur persentase progres yang tampil pada halaman tracking pelanggan. Persentase disimpan manual dan tidak dihitung dari jumlah tahapan.</p>
      </div>

      <div className="projects-toolbar">
        <div><h2>Progres Proyek</h2><p className="muted">{projects.length} proyek ditemukan · persentase 0–100%</p></div>
        <button type="button" className="logout-button" onClick={loadProjects} disabled={loading}><RefreshCw size={16} />Muat Ulang</button>
      </div>

      <div className="project-filters">
        <Search size={17} />
        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama atau kode proyek..." aria-label="Cari proyek tracking" />
      </div>

      {error && <div className="notice" role="alert">{error}</div>}
      {notice && <div className="notice" role="status">{notice}</div>}
      {loading && <p className="muted">Memuat proyek...</p>}
      {!loading && !error && filteredProjects.length === 0 && <div className="notice">Tidak ada proyek yang cocok dengan pencarian.</div>}

      {!loading && filteredProjects.length > 0 && (
        <div style={{ display: "grid", gap: 14 }}>
          {filteredProjects.map((project) => {
            const savedPercent = clampPercent(project.progress_percent);
            const draftValue = drafts[project.id] ?? String(savedPercent);
            const draftPercent = clampPercent(draftValue);
            const dirty = String(draftPercent) !== String(savedPercent);
            return (
              <article key={project.id} className="module-card" style={{ textAlign: "left", padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "start" }}>
                  <div style={{ minWidth: 220, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><ListChecks size={18} /><strong>{project.project_name || "Proyek tanpa nama"}</strong></div>
                    <p className="muted" style={{ margin: "0 0 6px" }}>{project.project_code || "Tanpa kode proyek"}</p>
                    <p className="muted" style={{ margin: 0 }}>Status: {statusLabels[project.status] || project.status || "—"} · Deadline: {formatDate(project.deadline)}</p>
                  </div>
                  <Link to="/admin/projects" className="logout-button" style={{ display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none" }}><ExternalLink size={15} />Kelola tahapan</Link>
                </div>

                <div style={{ marginTop: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 8 }}>
                    <label htmlFor={`progress-${project.id}`}><strong>Progres manual</strong></label>
                    <strong style={{ fontSize: 18 }}>{draftPercent}%</strong>
                  </div>
                  <input id={`progress-${project.id}`} type="range" min="0" max="100" step="1" value={draftPercent} onChange={(event) => setDrafts((current) => ({ ...current, [project.id]: event.target.value }))} style={{ width: "100%", accentColor: "#1e3a5f" }} aria-label={`Persentase progres ${project.project_name}`} />
                  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 10 }}>
                    <label htmlFor={`progress-number-${project.id}`} className="muted">Persentase:</label>
                    <input id={`progress-number-${project.id}`} type="number" min="0" max="100" step="1" value={draftValue} onChange={(event) => setDrafts((current) => ({ ...current, [project.id]: event.target.value }))} onBlur={() => setDrafts((current) => ({ ...current, [project.id]: String(clampPercent(current[project.id])) }))} style={{ width: 100 }} aria-label={`Masukkan persentase progres ${project.project_name}`} />
                    <button type="button" className="project-primary-button" onClick={() => saveProgress(project)} disabled={!dirty || Boolean(savingId)}><Save size={16} />{savingId === project.id ? "Menyimpan..." : "Simpan Progres"}</button>
                    {dirty && <button type="button" className="logout-button" onClick={() => setDrafts((current) => ({ ...current, [project.id]: String(savedPercent) }))} disabled={Boolean(savingId)}>Batalkan</button>}
                  </div>
                  <div style={{ height: 8, background: "#e2e8f0", borderRadius: 99, overflow: "hidden", marginTop: 14 }}><div style={{ height: "100%", width: `${savedPercent}%`, background: "#1e3a5f", transition: "width 200ms ease" }} /></div>
                  <p className="muted" style={{ fontSize: 12, margin: "6px 0 0" }}>Tersimpan saat ini: {savedPercent}%. Slider menunjukkan nilai yang sedang diedit; bar menunjukkan nilai tersimpan.</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
