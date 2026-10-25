import { useCallback, useEffect, useState } from "react";
import {
  FolderKanban,
  RefreshCw,
  Plus,
  X,
  Save,
  Pencil,
  Trash2,
  FileText,
  Users,
  ListChecks,
} from "lucide-react";
import { pb } from "../lib/pocketbase";

const statusLabels = {
  planning: "Perencanaan",
  in_progress: "Sedang Dikerjakan",
  review: "Menunggu Review",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const projectTypes = [
  { value: "company_profile", label: "Company Profile" },
  { value: "landing_page", label: "Landing Page" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "web_application", label: "Web Application" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Lainnya" },
];

const initialForm = {
  project_name: "",
  project_code: "",
  client: "",
  project_type: "company_profile",
  status: "planning",
  start_date: "",
  deadline: "",
  completion_date: "",
  contract_value: "",
  notes: "",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function dateForInput(value) {
  if (!value) return "";

  const match = String(value).match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : "";
}

function getRelationId(value) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

async function generateProjectCode() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());
  const prefix = `TRIMI-${day}${month}${year}-`;

  // Ambil kode proyek yang sudah tersimpan agar nomor berikutnya mengikuti urutan hari ini.
  const existingProjects = await pb.collection("projects").getFullList({
    fields: "id,project_code",
    requestKey: null,
  });

  const highestSequence = existingProjects.reduce((highest, project) => {
    const code = String(project.project_code || "");
    if (!code.startsWith(prefix)) return highest;

    const suffix = code.slice(prefix.length);
    if (!/^\d{3,}$/.test(suffix)) return highest;

    return Math.max(highest, Number(suffix) || 0);
  }, 0);

  return `${prefix}${String(highestSequence + 1).padStart(3, "0")}`;
}

function getClientName(project, clients) {
  const relationId = Array.isArray(project.client)
    ? project.client[0]
    : project.client;

  if (!relationId) return "—";

  const client = clients.find((item) => item.id === relationId);
  if (!client) return "—";

  if (client.company_name && client.client_name) {
    return `${client.company_name} — ${client.client_name}`;
  }

  return client.company_name || client.client_name || "—";
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [projectVendorLinks, setProjectVendorLinks] = useState([]);
  const [vendorProject, setVendorProject] = useState(null);
  const [vendorForm, setVendorForm] = useState({
    vendor: "",
    work_description: "",
    cost: "",
    status: "planned",
    notes: "",
  });
  const [vendorLoading, setVendorLoading] = useState(false);
  const [vendorSaving, setVendorSaving] = useState(false);
  const [vendorError, setVendorError] = useState("");
  const [vendorSuccess, setVendorSuccess] = useState("");
  const [deletingVendorLinkId, setDeletingVendorLinkId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [issuingInvoiceId, setIssuingInvoiceId] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingProjectId, setEditingProjectId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [progressProject, setProgressProject] = useState(null);
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [progressNotice, setProgressNotice] = useState("");
  const [editingUpdateId, setEditingUpdateId] = useState("");
  const emptyProgressForm = { title: "", update_date: new Date().toISOString().slice(0, 10), public_message: "", status: "planning", visible_to_client: true, sort_order: "1" };
  const [progressForm, setProgressForm] = useState(emptyProgressForm);


  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await pb.collection("projects").getList(1, 50, {
        requestKey: null,
      });

      setProjects(result.items);
    } catch (err) {
      console.error("Gagal memuat proyek:", err);
      console.error("Respons PocketBase:", err?.response);

      setError(
        err?.response?.message ||
          "Gagal memuat proyek. Periksa koneksi PocketBase."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadClients = useCallback(async () => {
    try {
      const result = await pb.collection("clients").getList(1, 100, {
        requestKey: null,
      });

      setClients(result.items);
    } catch (err) {
      console.error("Gagal memuat pilihan klien:", err);
    }
  }, []);

  const loadVendors = useCallback(async () => {
    try {
      const result = await pb.collection("vendors").getList(1, 200, {
        sort: "vendor_name",
        requestKey: null,
      });

      setVendors(result.items);
    } catch (err) {
      console.error("Gagal memuat pilihan vendor:", err);
    }
  }, []);

  const loadProjectVendorLinks = useCallback(async (projectId) => {
    if (!projectId) return;

    setVendorLoading(true);
    setVendorError("");

    try {
      const result = await pb.collection("project_vendors").getFullList({
        requestKey: null,
      });

      console.log("Data relasi vendor proyek:", result);
      setProjectVendorLinks(
        result.filter((item) => getRelationId(item.project) === projectId)
      );
    } catch (err) {
      console.error("Gagal memuat vendor proyek:", err);
      setVendorError(
        err?.response?.message ||
          "Gagal memuat relasi vendor. Periksa API Rules koleksi project_vendors."
      );
    } finally {
      setVendorLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
    loadClients();
    loadVendors();
  }, [loadProjects, loadClients, loadVendors]);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError("");
    setSuccess("");
  }

  function openForm() {
    setEditingProjectId("");
    setForm(initialForm);
    setFormError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(project) {
    setEditingProjectId(project.id);

    setForm({
      project_name: project.project_name || "",
      project_code: project.project_code || "",
      client: Array.isArray(project.client)
        ? project.client[0] || ""
        : project.client || "",
      project_type: project.project_type || "company_profile",
      status: project.status || "planning",
      start_date: dateForInput(project.start_date),
      deadline: dateForInput(project.deadline),
      completion_date: dateForInput(project.completion_date),
      contract_value: String(project.contract_value ?? ""),
      notes: project.notes || "",
    });

    setFormError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingProjectId("");
    setFormError("");
  }
    async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setSuccess("");

    const contractValue =
      form.contract_value === "" ? 0 : Number(form.contract_value);

    if (!form.project_name.trim()) {
      setFormError("Nama proyek wajib diisi.");
      return;
    }

    if (!Number.isFinite(contractValue) || contractValue < 0) {
      setFormError("Nilai kontrak harus berupa angka positif atau nol.");
      return;
    }

    if (
      form.start_date &&
      form.deadline &&
      form.deadline < form.start_date
    ) {
      setFormError("Deadline tidak boleh sebelum tanggal mulai.");
      return;
    }

    if (
      form.completion_date &&
      form.start_date &&
      form.completion_date < form.start_date
    ) {
      setFormError("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }

    setSaving(true);

    try {
      // Kode otomatis hanya dibuat saat proyek baru; saat edit, kode lama dipertahankan.
      const projectCode = editingProjectId
        ? form.project_code.trim()
        : await generateProjectCode();

      const payload = {
        project_name: form.project_name.trim(),
        project_code: projectCode,
        client: form.client || "",
        project_type: form.project_type,
        status: form.status,
        contract_value: contractValue,
        start_date: form.start_date
          ? `${form.start_date} 00:00:00.000Z`
          : "",
        deadline: form.deadline
          ? `${form.deadline} 00:00:00.000Z`
          : "",
        completion_date: form.completion_date
          ? `${form.completion_date} 00:00:00.000Z`
          : "",
        notes: form.notes.trim(),
      };

      if (editingProjectId) {
        await pb
          .collection("projects")
          .update(editingProjectId, payload);

        setSuccess("Proyek berhasil diperbarui.");
      } else {
        await pb.collection("projects").create(payload);

        setSuccess("Proyek berhasil ditambahkan.");
      }

      setShowForm(false);
      setEditingProjectId("");
      setForm(initialForm);

      await loadProjects();
    } catch (err) {
      console.error("Gagal menyimpan proyek:", err);
      console.error("Detail respons PocketBase:", err?.response);

      const fieldErrors = err?.response?.data;

      const firstFieldError = fieldErrors
        ? Object.entries(fieldErrors).find(([, detail]) => detail?.message)
        : null;

      setFormError(
        firstFieldError
          ? `${firstFieldError[0]}: ${firstFieldError[1].message}`
          : err?.response?.message ||
              "Proyek gagal disimpan. Periksa data dan API Rules."
      );
    } finally {
      setSaving(false);
    }
  }

  function openVendorManager(project) {
    setVendorProject(project);
    setVendorForm({
      vendor: "",
      work_description: "",
      cost: "",
      status: "planned",
      notes: "",
    });
    setVendorError("");
    setVendorSuccess("");
    setProjectVendorLinks([]);
    loadProjectVendorLinks(project.id);
    loadVendors();
  }

  function closeVendorManager() {
    if (vendorSaving || deletingVendorLinkId) return;
    setVendorProject(null);
    setProjectVendorLinks([]);
    setVendorError("");
    setVendorSuccess("");
  }

  async function handleAddProjectVendor(event) {
    event.preventDefault();
    setVendorError("");
    setVendorSuccess("");

    if (!vendorProject || !vendorForm.vendor) {
      setVendorError("Pilih vendor terlebih dahulu.");
      return;
    }

    const cost = vendorForm.cost === "" ? 0 : Number(vendorForm.cost);
    if (!Number.isFinite(cost) || cost < 0) {
      setVendorError("Biaya harus berupa angka positif atau nol.");
      return;
    }

    if (projectVendorLinks.some((link) => getRelationId(link.vendor) === vendorForm.vendor)) {
      setVendorError("Vendor ini sudah terhubung ke proyek tersebut.");
      return;
    }

    setVendorSaving(true);
    try {
      await pb.collection("project_vendors").create({
        project: vendorProject.id,
        vendor: vendorForm.vendor,
        work_description: vendorForm.work_description.trim(),
        cost,
        status: vendorForm.status,
        notes: vendorForm.notes.trim(),
      });

      setVendorSuccess("Vendor berhasil ditambahkan ke proyek.");
      setVendorForm({
        vendor: "",
        work_description: "",
        cost: "",
        status: "planned",
        notes: "",
      });
      await loadProjectVendorLinks(vendorProject.id);
    } catch (err) {
      console.error("Gagal menghubungkan vendor:", err);
      console.error("Respons PocketBase:", err?.response);
      const fieldErrors = err?.response?.data;
      const firstFieldError = fieldErrors
        ? Object.entries(fieldErrors).find(([, detail]) => detail?.message)
        : null;
      setVendorError(
        firstFieldError
          ? `${firstFieldError[0]}: ${firstFieldError[1].message}`
          : err?.response?.message ||
              "Vendor gagal ditambahkan. Periksa API Rules dan skema koleksi."
      );
    } finally {
      setVendorSaving(false);
    }
  }

  async function handleDeleteProjectVendor(link) {
    const vendorId = getRelationId(link.vendor);
    const vendor = vendors.find((item) => item.id === vendorId);
    const vendorName = vendor?.vendor_name || "vendor ini";
    if (!window.confirm(`Hapus hubungan ${vendorName} dari proyek ini? Data vendor tetap tersimpan.`)) return;

    setDeletingVendorLinkId(link.id);
    setVendorError("");
    setVendorSuccess("");
    try {
      await pb.collection("project_vendors").delete(link.id);
      setProjectVendorLinks((current) => current.filter((item) => item.id !== link.id));
      setVendorSuccess(`${vendorName} berhasil dilepas dari proyek.`);
    } catch (err) {
      console.error("Gagal melepas vendor dari proyek:", err);
      setVendorError(
        err?.response?.message ||
          "Relasi vendor gagal dihapus. Periksa API Rules PocketBase."
      );
    } finally {
      setDeletingVendorLinkId("");
    }
  }

  // Menerbitkan invoice dari proyek yang dipilih.
  // DP/pembayaran dicatat terpisah melalui section Pembayaran.
  async function handleIssueInvoice(project) {
    if (issuingInvoiceId) return;

    const contractValue = Number(project.contract_value || 0);

    if (!String(project.project_code || "").trim()) {
      setError("Kode proyek belum tersedia. Lengkapi kode proyek sebelum menerbitkan invoice.");
      setSuccess("");
      return;
    }

    if (!Number.isFinite(contractValue) || contractValue <= 0) {
      setError("Nilai kontrak proyek harus lebih besar dari Rp0.");
      setSuccess("");
      return;
    }

    setIssuingInvoiceId(project.id);
    setError("");
    setSuccess("");

    try {
      const invoiceResult = await pb
        .collection("invoices")
        .getFullList({ requestKey: null });

      const projectInvoices = invoiceResult.filter(
        (invoice) => getRelationId(invoice.project) === project.id
      );

      const existingInvoice = projectInvoices.find(
        (invoice) => invoice.status !== "cancelled"
      );

      if (existingInvoice) {
        setSuccess(
          `Invoice ${existingInvoice.invoice_number} sudah ada. Tidak ada invoice atau pembayaran baru yang dibuat.`
        );
        return;
      }

      if (projectInvoices.length > 0) {
        setError(
          "Proyek ini memiliki invoice yang pernah dibatalkan. Periksa riwayat invoice sebelum menerbitkan invoice baru."
        );
        return;
      }

      const today = new Date();
      const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");

      const createdInvoice = await pb.collection("invoices").create({
        invoice_number: project.project_code,
        project: project.id,
        client: getRelationId(project.client) || "",
        issue_date: `${todayString} 00:00:00.000Z`,
        due_date: "",
        amount: contractValue,
        status: "unpaid",
        notes: `Invoice untuk proyek ${project.project_name}`,
      });

      setSuccess(
        `Invoice ${createdInvoice.invoice_number} berhasil diterbitkan. Catat DP atau pembayaran lainnya melalui section Pembayaran.`
      );
    } catch (err) {
      console.error("Gagal menerbitkan invoice:", err);
      console.error("Respons PocketBase:", err?.response);

      setError(
        err?.response?.message ||
          "Invoice gagal diproses. Periksa koneksi dan aturan akses PocketBase."
      );
    } finally {
      setIssuingInvoiceId("");
    }
  }

  async function handleDelete(project) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus proyek "${project.project_name}" (${project.project_code})?\n\n` +
        "Relasi vendor untuk proyek ini akan dilepas terlebih dahulu. " +
        "Data invoice, pembayaran, dan riwayat tracking yang terkait akan membuat penghapusan dibatalkan agar tidak hilang."
    );

    if (!confirmed) return;

    setDeletingId(project.id);
    setError("");
    setSuccess("");

    try {
      // Pemeriksaan relasi dan penghapusan dilakukan di backend,
      // karena tracking_tokens tidak boleh dibaca langsung dari frontend.
      const result = await pb.send("/api/trimi/projects/delete", {
        method: "POST",
        body: { projectId: project.id },
        requestKey: null,
      });

      setProjects((current) => current.filter((item) => item.id !== project.id));
      setProjectVendorLinks((current) =>
        current.filter((link) => getRelationId(link.project) !== project.id)
      );
      setSuccess(
        result?.message || `Proyek "${project.project_name}" berhasil dihapus.`
      );
    } catch (err) {
      console.error("Gagal menghapus proyek:", err);
      console.error("Detail respons PocketBase:", err?.response);
      setError(
        err?.response?.message ||
          err?.message ||
          "Proyek gagal dihapus. Periksa relasi data dan konfigurasi hook PocketBase."
      );
    } finally {
      setDeletingId("");
    }
  }

  async function openProgressManager(project) {
    setProgressProject(project);
    setProgressLoading(true);
    setProgressError("");
    setProgressNotice("");
    setEditingUpdateId("");
    setProgressForm({ ...emptyProgressForm, sort_order: "1" });
    try {
      const result = await pb.collection("project_updates").getFullList({
        filter: `project = "${project.id}"`,
        sort: "sort_order,update_date",
        requestKey: null,
      });
      setProgressUpdates(result);
      setProgressForm({ ...emptyProgressForm, sort_order: String(result.length + 1) });
    } catch (err) {
      console.error("Gagal memuat tahapan proyek:", err, err?.response);
      setProgressError(err?.response?.message || "Tahapan gagal dimuat. Periksa API Rules collection project_updates.");
    } finally {
      setProgressLoading(false);
    }
  }

  function startEditUpdate(update) {
    setEditingUpdateId(update.id);
    setProgressForm({
      title: update.title || "",
      update_date: dateForInput(update.update_date) || new Date().toISOString().slice(0, 10),
      public_message: update.public_message || "",
      status: update.status || "planning",
      visible_to_client: Boolean(update.visible_to_client),
      sort_order: String(update.sort_order ?? 1),
    });
    setProgressError("");
    setProgressNotice("");
  }

  async function saveProgressUpdate(event) {
    event.preventDefault();
    if (!progressProject || progressSaving) return;
    if (!progressForm.title.trim()) {
      setProgressError("Nama tahapan wajib diisi.");
      return;
    }
    setProgressSaving(true);
    setProgressError("");
    setProgressNotice("");
    try {
      const payload = {
        project: progressProject.id,
        title: progressForm.title.trim(),
        update_date: progressForm.update_date ? `${progressForm.update_date} 00:00:00.000Z` : new Date().toISOString(),
        public_message: progressForm.public_message.trim(),
        status: progressForm.status,
        visible_to_client: Boolean(progressForm.visible_to_client),
        sort_order: Math.max(1, Number(progressForm.sort_order) || 1),
      };
      if (editingUpdateId) {
        await pb.collection("project_updates").update(editingUpdateId, payload);
        setProgressNotice("Tahapan berhasil diperbarui.");
      } else {
        await pb.collection("project_updates").create(payload);
        setProgressNotice("Tahapan berhasil ditambahkan.");
      }
      const result = await pb.collection("project_updates").getFullList({
        filter: `project = "${progressProject.id}"`, sort: "sort_order,update_date", requestKey: null,
      });
      setProgressUpdates(result);
      setEditingUpdateId("");
      setProgressForm({ ...emptyProgressForm, sort_order: String(result.length + 1) });
    } catch (err) {
      console.error("Gagal menyimpan tahapan:", err, err?.response);
      setProgressError(err?.response?.message || "Tahapan gagal disimpan. Periksa field dan API Rules PocketBase.");
    } finally {
      setProgressSaving(false);
    }
  }

  async function deleteProgressUpdate(update) {
    if (!window.confirm(`Hapus tahapan \"${update.title}\"?`)) return;
    setProgressError("");
    setProgressNotice("");
    try {
      await pb.collection("project_updates").delete(update.id);
      const result = await pb.collection("project_updates").getFullList({ filter: `project = "${progressProject.id}"`, sort: "sort_order,update_date", requestKey: null });
      setProgressUpdates(result);
      setProgressNotice("Tahapan dihapus.");
    } catch (err) {
      setProgressError(err?.response?.message || "Tahapan gagal dihapus. Periksa API Rules PocketBase.");
    }
  }

  const filteredProjects = projects.filter((project) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      !keyword ||
      (project.project_name || "").toLowerCase().includes(keyword) ||
      (project.project_code || "").toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalContract = projects.reduce(
    (total, project) => total + (Number(project.contract_value) || 0),
    0
  );

  return (
    <div>
              <div className="page-heading">
        <span className="eyebrow">MANAJEMEN BISNIS</span>
        <h1>Proyek</h1>
        <p className="muted">
          Kelola pekerjaan, deadline, dan nilai kontrak proyek.
        </p>
      </div>

      <div className="module-grid">
        <article className="module-card">
          <div className="module-icon">
            <FolderKanban size={21} />
          </div>
          <h2>{projects.length}</h2>
          <p>Total proyek tersimpan</p>
        </article>

        <article className="module-card">
          <div className="module-icon">
            <FolderKanban size={21} />
          </div>
          <h2>
            {projects.filter((p) => p.status === "in_progress").length}
          </h2>
          <p>Proyek berjalan</p>
        </article>

        <article className="module-card">
          <div className="module-icon">
            <FolderKanban size={21} />
          </div>
          <h2>{formatCurrency(totalContract)}</h2>
          <p>Total nilai kontrak</p>
        </article>
      </div>

      {success && (
        <div className="notice" role="status">
          {success}
        </div>
      )}

      {vendorProject && (
        <div
          className="project-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeVendorManager();
          }}
        >
          <section
            className="project-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-vendor-modal-title"
          >
            <div className="project-modal-header">
              <div>
                <h2 id="project-vendor-modal-title">Vendor Proyek</h2>
                <p className="muted">
                  {vendorProject.project_name} ({vendorProject.project_code})
                </p>
              </div>
              <button
                type="button"
                className="project-modal-close"
                onClick={closeVendorManager}
                disabled={vendorSaving || Boolean(deletingVendorLinkId)}
                aria-label="Tutup pengelolaan vendor"
                title="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProjectVendor}>
              <div className="project-form-grid">
                <label className="project-field">
                  Pilih Vendor *
                  <select
                    value={vendorForm.vendor}
                    onChange={(event) =>
                      setVendorForm((current) => ({ ...current, vendor: event.target.value }))
                    }
                    required
                  >
                    <option value="">Pilih vendor</option>
                    {vendors
                      .filter((vendor) => vendor.status !== "inactive")
                      .map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.vendor_name}
                          {vendor.company_name ? ` — ${vendor.company_name}` : ""}
                        </option>
                      ))}
                  </select>
                </label>

                <label className="project-field">
                  Biaya Vendor (Rp)
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={vendorForm.cost}
                    onChange={(event) =>
                      setVendorForm((current) => ({ ...current, cost: event.target.value }))
                    }
                    placeholder="0"
                  />
                </label>

                <label className="project-field">
                  Status Pekerjaan
                  <select
                    value={vendorForm.status}
                    onChange={(event) =>
                      setVendorForm((current) => ({ ...current, status: event.target.value }))
                    }
                  >
                    <option value="planned">Direncanakan</option>
                    <option value="in_progress">Sedang Dikerjakan</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </label>

                <label className="project-field">
                  Deskripsi Pekerjaan
                  <input
                    value={vendorForm.work_description}
                    onChange={(event) =>
                      setVendorForm((current) => ({ ...current, work_description: event.target.value }))
                    }
                    maxLength={2000}
                    placeholder="Contoh: Desain logo dan materi promosi"
                  />
                </label>

                <label className="project-field project-field-full">
                  Catatan
                  <textarea
                    value={vendorForm.notes}
                    onChange={(event) =>
                      setVendorForm((current) => ({ ...current, notes: event.target.value }))
                    }
                    rows={2}
                    maxLength={5000}
                    placeholder="Catatan tambahan (opsional)"
                  />
                </label>
              </div>

              {vendorError && <div className="notice" role="alert">{vendorError}</div>}
              {vendorSuccess && <div className="notice" role="status">{vendorSuccess}</div>}

              <div className="project-form-actions">
                <button
                  type="submit"
                  className="project-primary-button"
                  disabled={vendorSaving || !vendors.some((vendor) => vendor.status !== "inactive")}
                >
                  <Plus size={16} />
                  {vendorSaving ? "Menyimpan..." : "Hubungkan Vendor"}
                </button>
              </div>
            </form>

            <div style={{ marginTop: 24 }}>
              <h3>Vendor yang Terhubung</h3>
              {vendorLoading ? (
                <p className="muted">Memuat daftar vendor...</p>
              ) : projectVendorLinks.length === 0 ? (
                <p className="muted">Belum ada vendor yang terhubung ke proyek ini.</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {projectVendorLinks.map((link) => {
                    const vendorId = getRelationId(link.vendor);
                    const vendor = vendors.find((item) => item.id === vendorId);
                    const vendorStatusLabels = {
                      planned: "Direncanakan",
                      in_progress: "Sedang Dikerjakan",
                      completed: "Selesai",
                      cancelled: "Dibatalkan",
                    };
                    return (
                      <div
                        key={link.id}
                        style={{
                          border: "1px solid var(--border-color, #ddd)",
                          borderRadius: 10,
                          padding: 12,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div>
                          <strong>{vendor?.vendor_name || "Vendor tidak ditemukan"}</strong>
                          <div className="muted">{link.work_description || "Tanpa deskripsi pekerjaan"}</div>
                          <div className="muted">
                            {formatCurrency(link.cost)} · {vendorStatusLabels[link.status] || link.status}
                          </div>
                          {link.notes && <div className="muted">{link.notes}</div>}
                        </div>
                        <button
                          type="button"
                          className="project-icon-button project-delete-button"
                          onClick={() => handleDeleteProjectVendor(link)}
                          disabled={Boolean(deletingVendorLinkId)}
                          title="Lepas vendor dari proyek"
                          aria-label={`Lepas ${vendor?.vendor_name || "vendor"} dari proyek`}
                        >
                          <Trash2 size={16} />
                          {deletingVendorLinkId === link.id ? "..." : ""}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {progressProject && (
        <div className="project-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !progressSaving) setProgressProject(null); }}>
          <section className="project-modal" role="dialog" aria-modal="true" aria-labelledby="progress-modal-title">
            <div className="project-modal-header">
              <div>
                <h2 id="progress-modal-title">Kelola Progres Proyek</h2>
                <p className="muted">{progressProject.project_name} · {progressProject.project_code}</p>
              </div>
              <button type="button" className="project-modal-close" onClick={() => setProgressProject(null)} disabled={progressSaving} aria-label="Tutup"> <X size={20} /> </button>
            </div>
            <div style={{ margin: "8px 0 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><strong>Progres saat ini</strong><strong>{Number(progressProject.progress_percent || 0)}%</strong></div>
              <div style={{ height: 8, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.max(0, Math.min(100, Number(progressProject.progress_percent || 0)))}%`, background: "#1e3a5f", borderRadius: 99 }} /></div>
              <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>Persentase progres diatur manual melalui menu Order Tracking. Mengubah tahapan tidak akan menimpa persentase ini.</p>
            </div>
            {progressError && <div className="notice" role="alert">{progressError}</div>}
            {progressNotice && <div className="notice" role="status">{progressNotice}</div>}
            <h3>Tahapan Proyek</h3>
            {progressLoading ? <p className="muted">Memuat tahapan...</p> : progressUpdates.length === 0 ? <p className="muted">Belum ada tahapan. Tambahkan tahapan pertama melalui formulir di bawah.</p> : (
              <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
                {progressUpdates.map((update) => (
                  <div key={update.id} style={{ border: "1px solid var(--border-color, #ddd)", borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                    <div style={{ minWidth: 0 }}><strong>{update.sort_order}. {update.title}</strong><div className="muted">{formatDate(update.update_date)} · {statusLabels[update.status] || update.status} · {update.visible_to_client ? "Tampil ke customer" : "Internal"}</div>{update.public_message && <p className="muted" style={{ margin: "6px 0 0" }}>{update.public_message}</p>}</div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}><button type="button" className="project-icon-button" onClick={() => startEditUpdate(update)} title="Edit tahapan"><Pencil size={15} /></button><button type="button" className="project-icon-button project-delete-button" onClick={() => deleteProgressUpdate(update)} title="Hapus tahapan"><Trash2 size={15} /></button></div>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={saveProgressUpdate}>
              <h3>{editingUpdateId ? "Edit Tahapan" : "Tambah Tahapan"}</h3>
              <div className="project-form-grid">
                <label className="project-field">Nama Tahapan *<input value={progressForm.title} onChange={(e) => setProgressForm((f) => ({ ...f, title: e.target.value }))} placeholder="Contoh: Coding Frontend & Integrasi PocketBase" required maxLength={200} /></label>
                <label className="project-field">Urutan Tahapan *<input type="number" min="1" step="1" value={progressForm.sort_order} onChange={(e) => setProgressForm((f) => ({ ...f, sort_order: e.target.value }))} required /></label>
                <label className="project-field">Tanggal Pembaruan<input type="date" value={progressForm.update_date} onChange={(e) => setProgressForm((f) => ({ ...f, update_date: e.target.value }))} /></label>
                <label className="project-field">Status Tahapan<select value={progressForm.status} onChange={(e) => setProgressForm((f) => ({ ...f, status: e.target.value }))}><option value="planning">Belum Dimulai</option><option value="in_progress">Sedang Dikerjakan</option><option value="review">Menunggu Review</option><option value="completed">Selesai</option><option value="cancelled">Dibatalkan</option></select></label>
                <label className="project-field project-field-full">Keterangan untuk Customer<textarea rows={3} value={progressForm.public_message} onChange={(e) => setProgressForm((f) => ({ ...f, public_message: e.target.value }))} placeholder="Jelaskan progres tahap ini..." maxLength={5000} /></label>
                <label className="project-field project-field-full" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}><input type="checkbox" checked={progressForm.visible_to_client} onChange={(e) => setProgressForm((f) => ({ ...f, visible_to_client: e.target.checked }))} /> Tampilkan tahap ini ke customer</label>
              </div>
              <div className="project-form-actions">
                {editingUpdateId && <button type="button" className="logout-button" onClick={() => { setEditingUpdateId(""); setProgressForm({ ...emptyProgressForm, sort_order: String(progressUpdates.length + 1) }); }}>Batal Edit</button>}
                <button type="submit" className="project-primary-button" disabled={progressSaving}>{progressSaving ? "Menyimpan..." : editingUpdateId ? "Simpan Tahapan" : "Tambah Tahapan"}</button>
              </div>
            </form>
          </section>
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
            aria-labelledby="project-modal-title"
          >
            <div className="project-modal-header">
              <div>
                <h2 id="project-modal-title">
                  {editingProjectId ? "Edit Proyek" : "Tambah Proyek"}
                </h2>

                <p className="muted">
                  {editingProjectId
                    ? "Perubahan akan disimpan pada proyek yang sama."
                    : "Isi informasi dasar proyek baru."}
                </p>
              </div>

              <button
                type="button"
                className="project-modal-close"
                onClick={closeForm}
                disabled={saving}
                aria-label="Tutup form"
                title="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="project-form-grid">
                <label className="project-field">
                  Nama Proyek *
                  <input
                    name="project_name"
                    value={form.project_name}
                    onChange={updateField}
                    placeholder="Contoh: Website Company Profile"
                    maxLength={200}
                    required
                  />
                </label>

                <label className="project-field">
                  Kode Proyek
                  <input
                    name="project_code"
                    value={form.project_code}
                    readOnly
                    placeholder={editingProjectId ? "Kode proyek" : "Dibuat otomatis saat disimpan"}
                    maxLength={50}
                    aria-describedby="project-code-help"
                  />
                  <small id="project-code-help" className="muted">
                    {editingProjectId
                      ? "Kode proyek tidak berubah saat diedit."
                      : "Kode dibuat otomatis dengan format TRIMI-TANGGALBULANTAHUN-001."}
                  </small>
                </label>

                <label className="project-field">
                  Klien
                  <select
                    name="client"
                    value={form.client}
                    onChange={updateField}
                  >
                    <option value="">Pilih klien (opsional)</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.company_name
                          ? `${client.company_name} — ${client.client_name}`
                          : client.client_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="project-field">
                  Jenis Proyek
                  <select
                    name="project_type"
                    value={form.project_type}
                    onChange={updateField}
                  >
                    {projectTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="project-field">
                  Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={updateField}
                    required
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="project-field">
                  Tanggal Mulai
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={updateField}
                  />
                </label>

                <label className="project-field">
                  Deadline
                  <input
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={updateField}
                  />
                </label>

                <label className="project-field">
                  Tanggal Selesai
                  <input
                    type="date"
                    name="completion_date"
                    value={form.completion_date}
                    onChange={updateField}
                  />
                </label>

                <label className="project-field">
                  Nilai Kontrak (Rp)
                  <input
                    type="number"
                    name="contract_value"
                    value={form.contract_value}
                    onChange={updateField}
                    min="0"
                    step="1"
                    placeholder="0"
                  />
                </label>

                <label className="project-field project-field-full">
                  Catatan
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={updateField}
                    rows={4}
                    maxLength={5000}
                    placeholder="Detail pekerjaan atau catatan lainnya..."
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
                    : editingProjectId
                      ? "Simpan Perubahan"
                      : "Simpan Proyek"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <div className="projects-toolbar">
        <div>
          <h2>Daftar Proyek</h2>
          <p className="muted">
            Menampilkan maksimal 50 proyek terbaru.
          </p>
        </div>

        <div className="project-toolbar-actions">
          <button
            type="button"
            className="logout-button"
            onClick={loadProjects}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Muat Ulang
          </button>

          <button
            type="button"
            className="project-primary-button"
            onClick={openForm}
          >
            <Plus size={17} />
            Tambah Proyek
          </button>
        </div>
      </div>

      <div className="project-filters">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nama atau kode proyek..."
          aria-label="Cari proyek"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter status proyek"
        >
          <option value="all">Semua Status</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
            {loading && <p className="muted">Memuat data proyek...</p>}

      {!loading && error && (
        <div className="notice" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && filteredProjects.length === 0 && (
        <div className="notice">
          {projects.length === 0
            ? "Belum ada data proyek."
            : "Tidak ada proyek yang cocok dengan pencarian atau filter."}
        </div>
      )}

      {!loading && !error && filteredProjects.length > 0 && (
        <div className="projects-table-wrap">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Nama Proyek</th>
                <th>Kode</th>
                <th>Klien</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Nilai Kontrak</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <strong>{project.project_name}</strong>
                  </td>

                  <td>{project.project_code || "—"}</td>

                  <td>{getClientName(project, clients)}</td>

                  <td>
                    {statusLabels[project.status] || project.status || "—"}
                  </td>

                  <td>{formatDate(project.deadline)}</td>

                  <td>{formatCurrency(project.contract_value)}</td>

                  <td>
                    <div className="project-row-actions">
                      <button
                        type="button"
                        className="project-icon-button"
                        title="Kelola progres proyek"
                        aria-label={`Kelola progres ${project.project_name}`}
                        onClick={() => openProgressManager(project)}
                        disabled={Boolean(deletingId) || saving || Boolean(issuingInvoiceId)}
                      >
                        <ListChecks size={16} />
                        Progres
                      </button>
                      <button
                        type="button"
                        className="project-icon-button"
                        title="Kelola vendor proyek"
                        aria-label={`Kelola vendor untuk ${project.project_name}`}
                        onClick={() => openVendorManager(project)}
                        disabled={Boolean(deletingId) || saving || Boolean(issuingInvoiceId)}
                      >
                        <Users size={16} />
                        Vendor
                      </button>

                      {/* Tombol baru: Terbitkan Invoice */}
                      <button
                        type="button"
                        className="project-icon-button"
                        title="Terbitkan Invoice"
                        aria-label={`Terbitkan invoice untuk ${project.project_name}`}
                        onClick={() => handleIssueInvoice(project)}
                        disabled={
                          Boolean(issuingInvoiceId) ||
                          Boolean(deletingId) ||
                          saving
                        }
                      >
                        <FileText size={16} />
                        {issuingInvoiceId === project.id ? "..." : ""}
                      </button>

                      {/* Tombol edit yang sudah ada */}
                      <button
                        type="button"
                        className="project-icon-button"
                        title="Edit proyek"
                        aria-label={`Edit ${project.project_name}`}
                        onClick={() => {
                          openEditForm(project);
                        }}
                        disabled={Boolean(deletingId) || saving}
                      >
                        <Pencil size={16} />
                      </button>

                      {/* Tombol hapus yang sudah ada */}
                      <button
                        type="button"
                        className="project-icon-button project-delete-button"
                        title="Hapus proyek"
                        aria-label={`Hapus ${project.project_name}`}
                        onClick={() => handleDelete(project)}
                        disabled={Boolean(deletingId) || saving}
                      >
                        <Trash2 size={16} />
                        {deletingId === project.id ? "..." : ""}
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