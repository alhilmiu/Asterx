import { useCallback, useEffect, useMemo, useState } from "react";
import { pb } from "../lib/pocketbase";

const CATEGORY_OPTIONS = [
  { value: "transport", label: "Transportasi" },
  { value: "internet", label: "Internet dan komunikasi" },
  { value: "software", label: "Software dan langganan" },
  { value: "production", label: "Biaya produksi" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Lain-lain" },
];

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const today = () => {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const emptyForm = () => ({
  expense_name: "",
  project: "",
  expense_date: today(),
  category: "other",
  amount: "",
  notes: "",
});

function formatRupiah(value) {
  return currency.format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getErrorMessage(error) {
  const message = error?.response?.message;
  if (message) return message;
  if (error?.status === 403 || error?.status === 401) {
    return "Akses ditolak PocketBase. Periksa API Rules collection operational_expenses dan pastikan akun yang digunakan memiliki izin.";
  }
  return "Terjadi kesalahan. Periksa koneksi PocketBase lalu coba lagi.";
}

export default function OperationalExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [expenseRecords, projectRecords] = await Promise.all([
        pb.collection("operational_expenses").getFullList({
        requestKey: null,
        }),
        pb.collection("projects").getFullList({
          sort: "project_name",
          requestKey: null,
        }),
      ]);
      setExpenses(expenseRecords);
      setProjects(projectRecords);
    } catch (err) {
    console.error("Gagal memuat biaya operasional:", err);
    console.error("Detail respons PocketBase:", err?.response);
    console.error(
    "DETAIL ERROR LENGKAP:",
    JSON.stringify(err?.response?.data ?? err?.data, null, 2)
    );
    console.error("Data error:", err?.data);
    setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const projectNames = useMemo(() => {
    const map = new Map();
    projects.forEach((project) => {
      map.set(project.id, project.project_name || project.project_code || "Proyek tanpa nama");
    });
    return map;
  }, [projects]);

  const filteredExpenses = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return expenses.filter((expense) => {
      const categoryMatch = categoryFilter === "all" || expense.category === categoryFilter;
      const date = String(expense.expense_date || "").slice(0, 10);
      const startMatch = !startDate || (date && date >= startDate);
      const endMatch = !endDate || (date && date <= endDate);
      const projectName = projectNames.get(expense.project) || "";
      const keywordMatch =
        !keyword ||
        String(expense.expense_name || "").toLowerCase().includes(keyword) ||
        String(expense.notes || "").toLowerCase().includes(keyword) ||
        projectName.toLowerCase().includes(keyword);
      return categoryMatch && startMatch && endMatch && keywordMatch;
    });
  }, [expenses, categoryFilter, startDate, endDate, search, projectNames]);

  const totalFiltered = useMemo(
    () => filteredExpenses.reduce((total, expense) => total + (Number(expense.amount) || 0), 0),
    [filteredExpenses]
  );

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm());
    setEditingId("");
  }

  function startEdit(expense) {
    setEditingId(expense.id);
    setForm({
      expense_name: expense.expense_name || "",
      project: expense.project || "",
      expense_date: String(expense.expense_date || "").slice(0, 10),
      category: expense.category || "other",
      amount: String(expense.amount ?? ""),
      notes: expense.notes || "",
    });
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.expense_name.trim()) {
      setError("Nama pengeluaran wajib diisi.");
      return;
    }
    if (!form.expense_date) {
      setError("Tanggal pengeluaran wajib diisi.");
      return;
    }
    if (form.amount === "" || !Number.isFinite(Number(form.amount)) || Number(form.amount) < 0) {
      setError("Nominal harus berupa angka nol atau lebih.");
      return;
    }

    const payload = {
      expense_name: form.expense_name.trim(),
      project: form.project || null,
      expense_date: `${form.expense_date} 00:00:00.000Z`,
      category: form.category,
      amount: Number(form.amount),
      notes: form.notes.trim(),
    };

    setSaving(true);
    try {
      if (editingId) {
        await pb.collection("operational_expenses").update(editingId, payload);
        setNotice("Biaya operasional berhasil diperbarui.");
      } else {
        await pb.collection("operational_expenses").create(payload);
        setNotice("Biaya operasional berhasil ditambahkan.");
      }
      resetForm();
      await loadData();
    } catch (err) {
      console.error("Gagal menyimpan biaya operasional:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(expense) {
    const confirmed = window.confirm(
      `Hapus pengeluaran "${expense.expense_name}" sebesar ${formatRupiah(expense.amount)}?`
    );
    if (!confirmed) return;

    setError("");
    setNotice("");
    try {
      await pb.collection("operational_expenses").delete(expense.id);
      setExpenses((current) => current.filter((item) => item.id !== expense.id));
      if (editingId === expense.id) resetForm();
      setNotice("Biaya operasional berhasil dihapus.");
    } catch (err) {
      console.error("Gagal menghapus biaya operasional:", err);
      setError(getErrorMessage(err));
    }
  }

  function exportCsv() {
    const headers = [
      "Tanggal",
      "Nama Pengeluaran",
      "Kategori",
      "Proyek",
      "Nominal",
      "Catatan",
    ];
    const rows = filteredExpenses.map((expense) => [
      String(expense.expense_date || "").slice(0, 10),
      expense.expense_name || "",
      CATEGORY_OPTIONS.find((item) => item.value === expense.category)?.label || expense.category || "",
      projectNames.get(expense.project) || "Umum / tidak terkait proyek",
      Number(expense.amount) || 0,
      expense.notes || "",
    ]);
    const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = "\uFEFF" + [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `biaya-operasional-${today()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page-container">
      <div className="page-heading">
        <span className="eyebrow">MANAJEMEN BISNIS</span>
        <h1>Biaya Operasional</h1>
        <p className="muted">Catat dan kelola pengeluaran umum maupun biaya yang terkait dengan proyek.</p>
      </div>

      {error && (
        <div role="alert" style={{ padding: 12, marginBottom: 16, borderRadius: 8, background: "#fee2e2", color: "#991b1b" }}>
          {error}
        </div>
      )}
      {notice && (
        <div role="status" style={{ padding: 12, marginBottom: 16, borderRadius: 8, background: "#dcfce7", color: "#166534" }}>
          {notice}
        </div>
      )}

      <section className="dashboard-card" style={{ padding: 20, marginBottom: 24, border: "1px solid var(--border-color, #e5e7eb)", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>{editingId ? "Edit Pengeluaran" : "Tambah Pengeluaran"}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <label style={{ display: "grid", gap: 6 }}>
              Nama Pengeluaran *
              <input value={form.expense_name} onChange={(event) => updateForm("expense_name", event.target.value)} required maxLength={255} placeholder="Contoh: Transport meeting klien" />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              Tanggal *
              <input type="date" value={form.expense_date} onChange={(event) => updateForm("expense_date", event.target.value)} required />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              Kategori *
              <select value={form.category} onChange={(event) => updateForm("category", event.target.value)} required>
                {CATEGORY_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              Proyek (opsional)
              <select value={form.project} onChange={(event) => updateForm("project", event.target.value)}>
                <option value="">Umum / tidak terkait proyek</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.project_name || project.project_code || "Proyek tanpa nama"}
                    {project.project_code ? ` (${project.project_code})` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              Nominal (Rp) *
              <input type="number" min="0" step="1" value={form.amount} onChange={(event) => updateForm("amount", event.target.value)} required placeholder="Contoh: 150000" />
            </label>
            <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}>
              Catatan
              <textarea value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} rows={3} maxLength={2000} placeholder="Catatan tambahan (opsional)" />
            </label>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            <button type="submit" disabled={saving || loading}>{saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Pengeluaran"}</button>
            {editingId && <button type="button" onClick={resetForm} disabled={saving}>Batal Edit</button>}
          </div>
        </form>
      </section>

      <section style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
          <article className="dashboard-card" style={{ padding: 18, border: "1px solid var(--border-color, #e5e7eb)", borderRadius: 12 }}>
            <p className="muted" style={{ marginTop: 0 }}>Total sesuai filter</p>
            <h2 style={{ marginBottom: 0 }}>{formatRupiah(totalFiltered)}</h2>
          </article>
          <article className="dashboard-card" style={{ padding: 18, border: "1px solid var(--border-color, #e5e7eb)", borderRadius: 12 }}>
            <p className="muted" style={{ marginTop: 0 }}>Jumlah transaksi</p>
            <h2 style={{ marginBottom: 0 }}>{filteredExpenses.length}</h2>
          </article>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 12 }}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, catatan, atau proyek..." aria-label="Cari biaya operasional" />
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter kategori">
            <option value="all">Semua kategori</option>
            {CATEGORY_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
            Dari tanggal
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
            Sampai tanggal
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          <button type="button" onClick={exportCsv} disabled={filteredExpenses.length === 0}>Export CSV</button>
          <button type="button" onClick={() => { setSearch(""); setCategoryFilter("all"); setStartDate(""); setEndDate(""); }}>Reset Filter</button>
          <button type="button" onClick={loadData} disabled={loading}>{loading ? "Memuat..." : "Muat Ulang"}</button>
        </div>

        <div style={{ overflowX: "auto", border: "1px solid var(--border-color, #e5e7eb)", borderRadius: 12 }}>
          <table style={{ width: "100%", minWidth: 900, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Tanggal", "Pengeluaran", "Kategori", "Proyek", "Nominal", "Catatan", "Aksi"].map((heading) => (
                  <th key={heading} style={{ textAlign: "left", padding: 12, borderBottom: "1px solid var(--border-color, #e5e7eb)", whiteSpace: "nowrap" }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 16 }}>Memuat data biaya operasional...</td></tr>
              ) : filteredExpenses.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 16 }}>Belum ada pengeluaran yang sesuai filter.</td></tr>
              ) : filteredExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td style={{ padding: 12, whiteSpace: "nowrap" }}>{formatDate(expense.expense_date)}</td>
                  <td style={{ padding: 12, fontWeight: 600 }}>{expense.expense_name}</td>
                  <td style={{ padding: 12 }}>{CATEGORY_OPTIONS.find((item) => item.value === expense.category)?.label || expense.category}</td>
                  <td style={{ padding: 12 }}>{projectNames.get(expense.project) || "Umum"}</td>
                  <td style={{ padding: 12, whiteSpace: "nowrap" }}>{formatRupiah(expense.amount)}</td>
                  <td style={{ padding: 12, maxWidth: 240, whiteSpace: "pre-wrap" }}>{expense.notes || "—"}</td>
                  <td style={{ padding: 12, whiteSpace: "nowrap" }}>
                    <button type="button" onClick={() => startEdit(expense)} style={{ marginRight: 6 }}>Edit</button>
                    <button type="button" onClick={() => handleDelete(expense)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
