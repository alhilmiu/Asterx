
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  ImagePlus,
  X,
  RefreshCw,
  Search,
} from "lucide-react";
import { pb } from "../lib/pocketbase";

const emptyForm = {
  title: "",
  slug: "",
  category: "",
  description: "",
  website_url: "",
  demo_url: "",
  sort_order: 1,
  is_published: false,
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getErrorMessage(error) {
  const fieldErrors = error?.response?.data || {};
  const messages = Object.entries(fieldErrors)
    .filter(([, value]) => value?.message)
    .map(([field, value]) => `${field}: ${value.message}`);

  if (messages.length) return messages.join("\n");
  return error?.message || "Terjadi kesalahan. Silakan coba lagi.";
}

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const loadPortfolios = useCallback(async () => {
    setLoading(true);
    setError("");

    try {   
    const records = await pb.collection("portfolios").getFullList({
    sort: "sort_order,title",
    requestKey: null,
    });


      setPortfolios(records);
    } catch (err) {
      console.error("Portfolio gagal dimuat:", err);
      setError(
        "Portfolio gagal dimuat. Periksa koneksi PocketBase dan API Rules."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortfolios();
  }, [loadPortfolios]);

  function openCreateForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setCoverFile(null);
    setRemoveCover(false);
    setError("");
    setSuccess("");
    setFormOpen(true);
  }

  function openEditForm(item) {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      slug: item.slug || "",
      category: item.category || "",
      description: item.description || "",
      website_url: item.website_url || "",
      demo_url: item.demo_url || "",
      sort_order: item.sort_order ?? 1,
      is_published: Boolean(item.is_published),
    });
    setCoverFile(null);
    setRemoveCover(false);
    setError("");
    setSuccess("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    setEditingId(null);
    setCoverFile(null);
    setRemoveCover(false);
  }

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "title" && !editingId
        ? { slug: slugify(value) }
        : {}),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const title = form.title.trim();
    const slug = form.slug.trim();
    const category = form.category.trim();

    if (!title || !slug || !category) {
      setError("Judul, slug, dan kategori wajib diisi.");
      return;
    }

    const data = new FormData();
    data.append("title", title);
    data.append("slug", slug);
    data.append("category", category);
    data.append("description", form.description.trim());
    data.append("website_url", form.website_url.trim());
    data.append("demo_url", form.demo_url.trim());
    data.append("sort_order", String(Number(form.sort_order) || 0));
    data.append("is_published", String(form.is_published));

    if (coverFile) {
      data.append("cover_image", coverFile);
    } else if (removeCover && editingId) {
      data.append("cover_image", "");
    }

    setSaving(true);

    try {
      if (editingId) {
        await pb.collection("portfolios").update(editingId, data);
        setSuccess("Portfolio berhasil diperbarui.");
      } else {
        await pb.collection("portfolios").create(data);
        setSuccess("Portfolio berhasil ditambahkan.");
      }

      setFormOpen(false);
      setEditingId(null);
      setCoverFile(null);
      setRemoveCover(false);
      await loadPortfolios();
    } catch (err) {
      console.error("Portfolio gagal disimpan:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(item) {
    setError("");
    setSuccess("");

    try {
      await pb.collection("portfolios").update(item.id, {
        is_published: !item.is_published,
      });

      setSuccess(
        !item.is_published
          ? "Portfolio berhasil dipublikasikan."
          : "Portfolio berhasil disembunyikan."
      );

      await loadPortfolios();
    } catch (err) {
      console.error("Status portfolio gagal diubah:", err);
      setError(getErrorMessage(err));
    }
  }

  async function deletePortfolio(item) {
    const confirmed = window.confirm(
      `Hapus portfolio "${item.title}"?\nTindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await pb.collection("portfolios").delete(item.id);
      setSuccess("Portfolio berhasil dihapus.");
      await loadPortfolios();
    } catch (err) {
      console.error("Portfolio gagal dihapus:", err);
      setError(getErrorMessage(err));
    }
  }

  function getCoverUrl(item) {
    if (!item.cover_image) return "";

    return pb.files.getURL(item, item.cover_image);
  }

  const filteredPortfolios = portfolios.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.slug && item.slug.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q));
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-heading">
      <div className="portfolio-admin-heading">
        <div>
          <span className="eyebrow">MANAJEMEN KONTEN</span>
          <h1>Portfolio</h1>
          <p className="muted">
            Kelola proyek yang ditampilkan di homepage TriMi.
          </p>
        </div>

        <button
          type="button"
          className="portfolio-admin-primary"
          onClick={openCreateForm}
        >
          <Plus size={18} />
          Tambah Portfolio
        </button>
      </div>

      {error && !formOpen && (
        <div className="portfolio-admin-alert error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="portfolio-admin-alert success" role="status">
          {success}
        </div>
      )}

      {formOpen && (
        <section className="portfolio-admin-form-card">
          <div className="portfolio-admin-form-heading">
            <div>
              <h2>{editingId ? "Edit Portfolio" : "Portfolio Baru"}</h2>
              <p className="muted">
                Isi informasi proyek yang ingin dikelola.
              </p>
            </div>

            <button
              type="button"
              className="portfolio-admin-icon-button"
              onClick={closeForm}
              disabled={saving}
              aria-label="Tutup formulir"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="portfolio-admin-alert error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="portfolio-admin-form-grid">
              <label>
                Judul *
                <input
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  maxLength={200}
                  required
                />
              </label>

              <label>
                Slug *
                <input
                  name="slug"
                  value={form.slug}
                  onChange={updateField}
                  maxLength={200}
                  required
                />
                <small>Contoh: endymata-uniform</small>
              </label>

              <label>
                Kategori *
                <input
                  name="category"
                  value={form.category}
                  onChange={updateField}
                  maxLength={100}
                  placeholder="Website Bisnis"
                  required
                />
              </label>

              <label>
                Urutan tampil
                <input
                  name="sort_order"
                  type="number"
                  step="1"
                  value={form.sort_order}
                  onChange={updateField}
                />
              </label>

              <label className="portfolio-admin-full">
                Deskripsi
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  maxLength={2000}
                  rows={4}
                />
              </label>

              <label className="portfolio-admin-full">
                URL Website
                <input
                  name="website_url"
                  type="url"
                  value={form.website_url}
                  onChange={updateField}
                  placeholder="https://contoh.com"
                />
              </label>

              <label className="portfolio-admin-full">
                URL Demo
                <input
                  name="demo_url"
                  type="url"
                  value={form.demo_url}
                  onChange={updateField}
                  placeholder="https://demo.contoh.com"
                />
              </label>

              <label className="portfolio-admin-full">
                Cover Image
                <span className="portfolio-admin-file-field">
                  <ImagePlus size={20} />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      setCoverFile(event.target.files?.[0] || null);
                      setRemoveCover(false);
                    }}
                  />
                </span>
                <small>JPG, PNG, atau WebP. Maksimal 5 MB.</small>
              </label>

              {editingId && getCoverUrl(
                portfolios.find((item) => item.id === editingId) || {}
              ) && (
                <div className="portfolio-admin-current-cover portfolio-admin-full">
                  <img
                    src={getCoverUrl(
                      portfolios.find((item) => item.id === editingId)
                    )}
                    alt="Cover saat ini"
                  />
                  <label className="portfolio-admin-checkbox">
                    <input
                      type="checkbox"
                      checked={removeCover}
                      onChange={(event) => setRemoveCover(event.target.checked)}
                    />
                    Hapus cover saat ini
                  </label>
                </div>
              )}

              {coverFile && (
                <p className="portfolio-admin-full muted">
                  File dipilih: {coverFile.name}
                </p>
              )}

              <label className="portfolio-admin-checkbox portfolio-admin-full">
                <input
                  name="is_published"
                  type="checkbox"
                  checked={form.is_published}
                  onChange={updateField}
                />
                Publikasikan portfolio di homepage
              </label>
            </div>

            <div className="portfolio-admin-form-actions">
              <button
                type="button"
                className="portfolio-admin-secondary"
                onClick={closeForm}
                disabled={saving}
              >
                Batal
              </button>

              <button
                type="submit"
                className="portfolio-admin-primary"
                disabled={saving}
              >
                {saving ? "Menyimpan..." : "Simpan Portfolio"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="portfolio-admin-list">
        <div className="portfolio-admin-list-heading">
          <div>
            <h2>Daftar Portfolio</h2>
            <p className="muted">
              {portfolios.length} portfolio tersimpan
            </p>
          </div>

          <button
            type="button"
            className="portfolio-admin-secondary"
            onClick={loadPortfolios}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Muat ulang
          </button>
        </div>

        {/* Toolbar Pencarian & Filter Kategori untuk Skalabilitas */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", margin: "18px 0", flexWrap: "wrap" }}>
          <div className="client-search" style={{ flex: 1, minWidth: "240px", height: "42px" }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari berdasarkan judul, slug, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", fontSize: "13px" }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: "0 14px",
              borderRadius: "9px",
              border: "1px solid #d9dce3",
              fontSize: "13px",
              height: "42px",
              background: "white",
              color: "#493b3e",
              fontWeight: 500,
            }}
          >
            <option value="all">Semua Kategori ({portfolios.length})</option>
            {Array.from(new Set(portfolios.map((p) => p.category).filter(Boolean))).map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({portfolios.filter((p) => p.category === cat).length})
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="muted">Memuat portfolio...</p>
        ) : portfolios.length === 0 ? (
          <div className="portfolio-admin-empty">
            Belum ada portfolio. Klik Tambah Portfolio untuk memulai.
          </div>
        ) : filteredPortfolios.length === 0 ? (
          <div className="portfolio-admin-empty">
            Tidak ada portfolio yang cocok dengan pencarian "{searchQuery}".
          </div>
        ) : (
          <div className="portfolio-admin-table-wrap">
            <table className="portfolio-admin-table">
              <thead>
                <tr>
                  <th>Portfolio</th>
                  <th>Kategori</th>
                  <th>Urutan</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredPortfolios.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="portfolio-admin-item">
                        {item.cover_image ? (
                          <img
                            src={getCoverUrl(item)}
                            alt=""
                            className="portfolio-admin-thumbnail"
                          />
                        ) : (
                          <div className="portfolio-admin-thumbnail placeholder">
                            <ImagePlus size={20} />
                          </div>
                        )}

                        <div>
                          <strong>{item.title}</strong>
                          <small>{item.slug}</small>
                        </div>
                      </div>
                    </td>

                    <td>{item.category}</td>
                    <td>{item.sort_order ?? 0}</td>

                    <td>
                      <span
                        className={`portfolio-admin-status ${
                          item.is_published ? "published" : "draft"
                        }`}
                      >
                        {item.is_published ? "Dipublikasikan" : "Draft"}
                      </span>
                    </td>

                    <td>
                      <div className="portfolio-admin-row-actions">
                        <button
                          type="button"
                          className="portfolio-admin-icon-button"
                          title={
                            item.is_published
                              ? "Sembunyikan"
                              : "Publikasikan"
                          }
                          aria-label={
                            item.is_published
                              ? "Sembunyikan portfolio"
                              : "Publikasikan portfolio"
                          }
                          onClick={() => togglePublished(item)}
                        >
                          {item.is_published ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>

                        <button
                          type="button"
                          className="portfolio-admin-icon-button"
                          title="Edit"
                          aria-label={`Edit ${item.title}`}
                          onClick={() => openEditForm(item)}
                        >
                          <Pencil size={17} />
                        </button>

                        {item.website_url && (
                          <a
                            className="portfolio-admin-icon-button"
                            href={item.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Buka website"
                            aria-label={`Buka website ${item.title}`}
                          >
                            <ExternalLink size={17} />
                          </a>
                        )}

                        <button
                          type="button"
                          className="portfolio-admin-icon-button danger"
                          title="Hapus"
                          aria-label={`Hapus ${item.title}`}
                          onClick={() => deletePortfolio(item)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
