import { useCallback, useEffect, useState } from "react";
import {
  Users,
  Plus,
  X,
  Save,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  Truck,
} from "lucide-react";
import { pb } from "../lib/pocketbase";

const vendorCategoryLabels = {
  design: "Desain",
  printing: "Percetakan",
  photography: "Fotografi",
  video: "Videografi",
  catering: "Katering",
  venue: "Tempat / Venue",
  decoration: "Dekorasi",
  digital_service: "Jasa Digital",
  equipment: "Peralatan",
  other: "Lainnya",
};

const vendorStatusLabels = {
  active: "Aktif",
  inactive: "Tidak Aktif",
};

const initialForm = {
  vendor_name: "",
  company_name: "",
  phone: "",
  email: "",
  address: "",
  category: "other",
  status: "active",
  payment_terms: "",
  notes: "",
};

function getErrorMessage(err) {
  const fieldErrors = err?.response?.data;

  if (fieldErrors) {
    const firstError = Object.entries(fieldErrors).find(
      ([, detail]) => detail?.message
    );

    if (firstError) {
      return `${firstError[0]}: ${firstError[1].message}`;
    }
  }

  return (
    err?.response?.message ||
    "Terjadi kesalahan. Periksa koneksi PocketBase dan API Rules."
  );
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadVendors = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      
    const result = await pb.collection("vendors").getList(1, 50, {
    requestKey: null,
    });

setVendors(result.items);

      setVendors(result.items);
    } catch (err) {
      console.error("Gagal memuat vendor:", err);
      console.error("Detail PocketBase:", err?.response);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError("");
    setSuccess("");
  }

  function openCreateForm() {
    setEditingId("");
    setForm(initialForm);
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(vendor) {
    setEditingId(vendor.id);

    setForm({
      vendor_name: vendor.vendor_name || "",
      company_name: vendor.company_name || "",
      phone: vendor.phone || "",
      email: vendor.email || "",
      address: vendor.address || "",
      category: vendor.category || "other",
      status: vendor.status || "active",
      payment_terms: vendor.payment_terms || "",
      notes: vendor.notes || "",
    });

    setFormError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId("");
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setFormError("");
    setError("");
    setSuccess("");

    if (!form.vendor_name.trim()) {
      setFormError("Nama vendor wajib diisi.");
      return;
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      setFormError("Format email tidak valid.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        vendor_name: form.vendor_name.trim(),
        company_name: form.company_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        category: form.category,
        status: form.status,
        payment_terms: form.payment_terms.trim(),
        notes: form.notes.trim(),
      };

      if (editingId) {
        await pb.collection("vendors").update(editingId, payload);
      } else {
        await pb.collection("vendors").create(payload);
      }

      setSuccess(
        editingId
          ? "Data vendor berhasil diperbarui."
          : "Vendor berhasil ditambahkan."
      );

      setShowForm(false);
      setEditingId("");
      setForm(initialForm);

      await loadVendors();
    } catch (err) {
      console.error("Gagal menyimpan vendor:", err);
      console.error("Detail PocketBase:", err?.response);
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(vendor) {
    const confirmed = window.confirm(
      `Hapus vendor "${vendor.vendor_name}"?\n\nPastikan vendor ini tidak sedang digunakan dalam order atau booking.`
    );

    if (!confirmed) return;

    setDeletingId(vendor.id);
    setError("");
    setSuccess("");

    try {
      await pb.collection("vendors").delete(vendor.id);

      setVendors((current) =>
        current.filter((item) => item.id !== vendor.id)
      );

      setSuccess(
        `Vendor "${vendor.vendor_name}" berhasil dihapus.`
      );
    } catch (err) {
      console.error("Gagal menghapus vendor:", err);
      console.error("Detail PocketBase:", err?.response);
      setError(getErrorMessage(err));
    } finally {
      setDeletingId("");
    }
  }

  const filteredVendors = vendors.filter((vendor) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      !keyword ||
      [
        vendor.vendor_name,
        vendor.company_name,
        vendor.phone,
        vendor.email,
      ].some((value) => (value || "").toLowerCase().includes(keyword));

    const matchesCategory =
      categoryFilter === "all" ||
      vendor.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" || vendor.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeCount = vendors.filter(
    (vendor) => vendor.status === "active"
  ).length;

  const inactiveCount = vendors.filter(
    (vendor) => vendor.status === "inactive"
  ).length;

  return (
    <div>
      <div className="page-heading">
        <span className="eyebrow">MANAJEMEN BISNIS</span>
        <h1>Vendor</h1>
        <p className="muted">
          Kelola data pemasok, freelancer, dan mitra layanan TriMi.
        </p>
      </div>

      <div className="module-grid">
        <article className="module-card">
          <div className="module-icon">
            <Truck size={21} />
          </div>
          <h2>{vendors.length}</h2>
          <p>Total vendor tersimpan</p>
        </article>

        <article className="module-card">
          <div className="module-icon">
            <Users size={21} />
          </div>
          <h2>{activeCount}</h2>
          <p>Vendor aktif</p>
        </article>

        <article className="module-card">
          <div className="module-icon">
            <Users size={21} />
          </div>
          <h2>{inactiveCount}</h2>
          <p>Vendor tidak aktif</p>
        </article>
      </div>

      {success && (
        <div className="notice" role="status">
          {success}
        </div>
      )}

      {showForm && (
        <div
          className="project-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <section
            className="project-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vendor-modal-title"
          >
            <div className="project-modal-header">
              <div>
                <h2 id="vendor-modal-title">
                  {editingId ? "Edit Vendor" : "Tambah Vendor"}
                </h2>
                <p className="muted">
                  Lengkapi informasi vendor di bawah ini.
                </p>
              </div>

              <button
                type="button"
                className="project-modal-close"
                onClick={closeForm}
                disabled={saving}
                aria-label="Tutup form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="project-form-grid">
                <label className="project-field">
                  Nama Vendor *
                  <input
                    name="vendor_name"
                    value={form.vendor_name}
                    onChange={updateField}
                    maxLength={200}
                    placeholder="Nama vendor atau PIC"
                    required
                  />
                </label>

                <label className="project-field">
                  Nama Perusahaan
                  <input
                    name="company_name"
                    value={form.company_name}
                    onChange={updateField}
                    maxLength={200}
                    placeholder="Nama perusahaan (opsional)"
                  />
                </label>

                <label className="project-field">
                  Nomor Telepon / WhatsApp
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={updateField}
                    maxLength={50}
                    placeholder="08xxxxxxxxxx"
                  />
                </label>

                <label className="project-field">
                  Email
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={updateField}
                    maxLength={200}
                    placeholder="vendor@email.com"
                  />
                </label>

                <label className="project-field">
                  Kategori Vendor *
                  <select
                    name="category"
                    value={form.category}
                    onChange={updateField}
                    required
                  >
                    {Object.entries(vendorCategoryLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label className="project-field">
                  Status Vendor
                  <select
                    name="status"
                    value={form.status}
                    onChange={updateField}
                    required
                  >
                    {Object.entries(vendorStatusLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label className="project-field project-field-full">
                  Alamat
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={updateField}
                    rows={2}
                    placeholder="Alamat vendor atau perusahaan"
                  />
                </label>

                <label className="project-field project-field-full">
                  Ketentuan Pembayaran
                  <input
                    name="payment_terms"
                    value={form.payment_terms}
                    onChange={updateField}
                    maxLength={500}
                    placeholder="Contoh: DP 50%, pelunasan setelah pekerjaan selesai"
                  />
                </label>

                <label className="project-field project-field-full">
                  Catatan
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={updateField}
                    rows={3}
                    placeholder="Harga, layanan, atau informasi tambahan"
                  />
                </label>
              </div>

              {formError && (
                <div className="notice" role="alert">
                  {formError}
                </div>
              )}

              <div className="project-form-actions">
                <button
                  type="button"
                  className="logout-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="project-primary-button"
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Simpan Vendor"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <div className="projects-toolbar">
        <div>
          <h2>Daftar Vendor</h2>
          <p className="muted">
            Menampilkan maksimal 50 vendor terbaru.
          </p>
        </div>

        <div className="project-toolbar-actions">
          <button
            type="button"
            className="logout-button"
            onClick={loadVendors}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Muat Ulang
          </button>

          <button
            type="button"
            className="project-primary-button"
            onClick={openCreateForm}
          >
            <Plus size={17} />
            Tambah Vendor
          </button>
        </div>
      </div>

      <div className="project-filters">
        <div className="client-search">
          <Search size={17} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama, perusahaan, telepon, email..."
            aria-label="Cari vendor"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label="Filter kategori vendor"
        >
          <option value="all">Semua Kategori</option>
          {Object.entries(vendorCategoryLabels).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter status vendor"
        >
          <option value="all">Semua Status</option>
          {Object.entries(vendorStatusLabels).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            )
          )}
        </select>
      </div>

      {loading && (
        <p className="muted">Memuat data vendor...</p>
      )}

      {!loading && error && (
        <div className="notice" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && filteredVendors.length === 0 && (
        <div className="notice">
          {vendors.length === 0
            ? "Belum ada data vendor."
            : "Tidak ada vendor yang cocok dengan pencarian atau filter."}
        </div>
      )}

      {!loading && !error && filteredVendors.length > 0 && (
        <div className="projects-table-wrap">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Kontak</th>
                <th>Kategori</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td>
                    <strong>{vendor.vendor_name}</strong>
                    {vendor.company_name && (
                      <div className="client-company-name">
                        {vendor.company_name}
                      </div>
                    )}
                  </td>

                  <td>
                    <div>{vendor.phone || "—"}</div>
                    {vendor.email && (
                      <div className="client-company-name">
                        {vendor.email}
                      </div>
                    )}
                  </td>

                  <td>
                    {vendorCategoryLabels[vendor.category] ||
                      vendor.category ||
                      "—"}
                  </td>

                  <td>
                    {vendorStatusLabels[vendor.status] ||
                      vendor.status ||
                      "—"}
                  </td>

                  <td>
                    <div className="project-row-actions">
                      <button
                        type="button"
                        className="project-icon-button"
                        title="Edit vendor"
                        aria-label={`Edit ${vendor.vendor_name}`}
                        onClick={() => openEditForm(vendor)}
                        disabled={Boolean(deletingId) || saving}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        className="project-icon-button project-delete-button"
                        title="Hapus vendor"
                        aria-label={`Hapus ${vendor.vendor_name}`}
                        onClick={() => handleDelete(vendor)}
                        disabled={Boolean(deletingId) || saving}
                      >
                        <Trash2 size={16} />
                        {deletingId === vendor.id ? "..." : ""}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}