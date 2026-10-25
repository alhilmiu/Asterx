
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
} from "lucide-react";
import { pb } from "../lib/pocketbase";

const clientTypeLabels = {
  individual: "Individu",
  company: "Perusahaan",
};

const clientStatusLabels = {
  prospect: "Prospek",
  active: "Aktif",
  inactive: "Tidak Aktif",
};

const leadSourceLabels = {
  whatsapp: "WhatsApp",
  referral: "Referensi",
  social_media: "Media Sosial",
};

const initialForm = {
  client_name: "",
  company_name: "",
  phone: "",
  address: "",
  email: "",
  client_type: "individual",
  lead_source: "whatsapp",
  status: "prospect",
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

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await pb.collection("clients").getList(1, 50, {
        requestKey: null,
      });

      setClients(result.items);
    } catch (err) {
      console.error("Gagal memuat klien:", err);
      console.error("Detail PocketBase:", err?.response);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

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

  function openEditForm(client) {
    setEditingId(client.id);

    setForm({
      client_name: client.client_name || "",
      company_name: client.company_name || "",
      phone: client.phone || "",
      address: client.address || "",
      email: client.email || "",
      client_type: client.client_type || "individual",
      lead_source: client.lead_source || "whatsapp",
      status: client.status || "prospect",
      notes: client.notes || "",
    });

    setFormError("");
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
    setSuccess("");

    if (!form.client_name.trim()) {
      setFormError("Nama klien wajib diisi.");
      return;
    }

    if (
      form.client_type === "company" &&
      !form.company_name.trim()
    ) {
      setFormError("Nama perusahaan wajib diisi untuk klien perusahaan.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        client_name: form.client_name.trim(),
        company_name: form.company_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        email: form.email.trim(),
        client_type: form.client_type,
        lead_source: form.lead_source,
        status: form.status,
        notes: form.notes.trim(),
      };

      if (editingId) {
        await pb.collection("clients").update(editingId, payload);
      } else {
        await pb.collection("clients").create(payload);
      }

      setSuccess(
        editingId
          ? "Data klien berhasil diperbarui."
          : "Klien berhasil ditambahkan."
      );

      setShowForm(false);
      setEditingId("");
      setForm(initialForm);

      await loadClients();
    } catch (err) {
      console.error("Gagal menyimpan klien:", err);
      console.error("Detail PocketBase:", err?.response);
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(client) {
    const confirmed = window.confirm(
      `Hapus klien "${client.client_name}"?\n\nPastikan klien ini tidak sedang digunakan oleh proyek.`
    );

    if (!confirmed) return;

    setDeletingId(client.id);
    setError("");
    setSuccess("");

    try {
      await pb.collection("clients").delete(client.id);

      setClients((current) =>
        current.filter((item) => item.id !== client.id)
      );

      setSuccess(`Klien "${client.client_name}" berhasil dihapus.`);
    } catch (err) {
      console.error("Gagal menghapus klien:", err);
      console.error("Detail PocketBase:", err?.response);
      setError(getErrorMessage(err));
    } finally {
      setDeletingId("");
    }
  }

  const filteredClients = clients.filter((client) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      !keyword ||
      [
        client.client_name,
        client.company_name,
        client.phone,
        client.email,
      ].some((value) => (value || "").toLowerCase().includes(keyword));

    const matchesStatus =
      statusFilter === "all" || client.status === statusFilter;

    const matchesType =
      typeFilter === "all" || client.client_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const activeCount = clients.filter(
    (client) => client.status === "active"
  ).length;

  const prospectCount = clients.filter(
    (client) => client.status === "prospect"
  ).length;

  return (
    <div>
      <div className="page-heading">
        <span className="eyebrow">MANAJEMEN BISNIS</span>
        <h1>Klien</h1>
        <p className="muted">
          Kelola informasi pelanggan, perusahaan, dan sumber prospek.
        </p>
      </div>

      <div className="module-grid">
        <article className="module-card">
          <div className="module-icon">
            <Users size={21} />
          </div>
          <h2>{clients.length}</h2>
          <p>Total klien tersimpan</p>
        </article>

        <article className="module-card">
          <div className="module-icon">
            <Users size={21} />
          </div>
          <h2>{activeCount}</h2>
          <p>Klien aktif</p>
        </article>

        <article className="module-card">
          <div className="module-icon">
            <Users size={21} />
          </div>
          <h2>{prospectCount}</h2>
          <p>Prospek baru</p>
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
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <section
            className="project-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-modal-title"
          >
            <div className="project-modal-header">
              <div>
                <h2 id="client-modal-title">
                  {editingId ? "Edit Klien" : "Tambah Klien"}
                </h2>
                <p className="muted">
                  Lengkapi informasi klien di bawah ini.
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
                  Nama Klien *
                  <input
                    name="client_name"
                    value={form.client_name}
                    onChange={updateField}
                    maxLength={200}
                    placeholder="Nama lengkap atau PIC"
                    required
                  />
                </label>

                <label className="project-field">
                  Tipe Klien *
                  <select
                    name="client_type"
                    value={form.client_type}
                    onChange={updateField}
                    required
                  >
                    <option value="individual">Individu</option>
                    <option value="company">Perusahaan</option>
                  </select>
                </label>

                {form.client_type === "company" && (
                  <label className="project-field">
                    Nama Perusahaan *
                    <input
                      name="company_name"
                      value={form.company_name}
                      onChange={updateField}
                      placeholder="Nama perusahaan"
                      required
                    />
                  </label>
                )}

                <label className="project-field">
                  Nomor Telepon
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={updateField}
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
                    placeholder="nama@perusahaan.com"
                  />
                </label>

                <label className="project-field">
                  Sumber Prospek
                  <select
                    name="lead_source"
                    value={form.lead_source}
                    onChange={updateField}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="referral">Referensi</option>
                    <option value="social_media">Media Sosial</option>
                  </select>
                </label>

                <label className="project-field">
                  Status Klien
                  <select
                    name="status"
                    value={form.status}
                    onChange={updateField}
                  >
                    <option value="prospect">Prospek</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                  </select>
                </label>

                <label className="project-field project-field-full">
                  Alamat
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={updateField}
                    rows={2}
                    placeholder="Alamat klien atau perusahaan"
                  />
                </label>

                <label className="project-field project-field-full">
                  Catatan
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={updateField}
                    rows={3}
                    placeholder="Informasi tambahan atau riwayat komunikasi"
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
                      : "Simpan Klien"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <div className="projects-toolbar">
        <div>
          <h2>Daftar Klien</h2>
          <p className="muted">Maksimal 50 klien terbaru.</p>
        </div>

        <div className="project-toolbar-actions">
          <button
            type="button"
            className="logout-button"
            onClick={loadClients}
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
            Tambah Klien
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
            aria-label="Cari klien"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter status klien"
        >
          <option value="all">Semua Status</option>
          <option value="prospect">Prospek</option>
          <option value="active">Aktif</option>
          <option value="inactive">Tidak Aktif</option>
        </select>

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          aria-label="Filter tipe klien"
        >
          <option value="all">Semua Tipe</option>
          <option value="individual">Individu</option>
          <option value="company">Perusahaan</option>
        </select>
      </div>

      {loading && <p className="muted">Memuat data klien...</p>}

      {!loading && error && (
        <div className="notice" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && filteredClients.length === 0 && (
        <div className="notice">
          {clients.length === 0
            ? "Belum ada data klien."
            : "Tidak ada klien yang cocok dengan pencarian atau filter."}
        </div>
      )}

      {!loading && !error && filteredClients.length > 0 && (
        <div className="projects-table-wrap">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Klien</th>
                <th>Kontak</th>
                <th>Tipe</th>
                <th>Sumber</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <strong>{client.client_name}</strong>
                    {client.company_name && (
                      <div className="client-company-name">
                        {client.company_name}
                      </div>
                    )}
                  </td>

                  <td>
                    <div>{client.phone || "—"}</div>
                    {client.email && (
                      <div className="client-company-name">
                        {client.email}
                      </div>
                    )}
                  </td>

                  <td>
                    {clientTypeLabels[client.client_type] ||
                      client.client_type ||
                      "—"}
                  </td>

                  <td>
                    {leadSourceLabels[client.lead_source] ||
                      client.lead_source ||
                      "—"}
                  </td>

                  <td>
                    {clientStatusLabels[client.status] ||
                      client.status ||
                      "—"}
                  </td>

                  <td>
                    <div className="project-row-actions">
                      <button
                        type="button"
                        className="project-icon-button"
                        title="Edit klien"
                        aria-label={`Edit ${client.client_name}`}
                        onClick={() => openEditForm(client)}
                        disabled={Boolean(deletingId) || saving}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        className="project-icon-button project-delete-button"
                        title="Hapus klien"
                        aria-label={`Hapus ${client.client_name}`}
                        onClick={() => handleDelete(client)}
                        disabled={Boolean(deletingId) || saving}
                      >
                        <Trash2 size={16} />
                        {deletingId === client.id ? "..." : ""}
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
