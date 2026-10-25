import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, RefreshCw, FileText, Printer, Eye, X } from "lucide-react";
import { pb } from "../lib/pocketbase";

const invoiceStatuses = [

  { value: "draft", label: "Draft" },

  { value: "unpaid", label: "Belum Dibayar" },

  { value: "partially_paid", label: "Dibayar Sebagian" },

  { value: "paid", label: "Lunas" },

  { value: "overdue", label: "Terlambat" },

  { value: "cancelled", label: "Dibatalkan" },

];

const initialForm = {

  invoice_number: "",

  project: "",

  client: "",

  issue_date: new Date().toISOString().slice(0, 10),

  due_date: "",

  amount: "",

  status: "draft",

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

    timeZone: "UTC",

  });

}

function dateForInput(value) {

  return value ? String(value).slice(0, 10) : "";

}

function getRelationId(value) {

  return Array.isArray(value) ? value[0] || "" : value || "";

}

function toPocketBaseDate(value) {

  return value ? `${value} 00:00:00.000Z` : "";

}

export default function InvoicesPage() {

  const [invoices, setInvoices] = useState([]);

  const [projects, setProjects] = useState([]);

  const [clients, setClients] = useState([]);

  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const [trackingLoadingId, setTrackingLoadingId] = useState(null);

  const [trackingLinks, setTrackingLinks] = useState({});

  const [form, setForm] = useState(initialForm);

  const loadData = useCallback(async () => {

    setLoading(true);

    setError("");

    try {

      const [invoiceResult, projectResult, clientResult, paymentResult] =

        await Promise.all([

          pb.collection("invoices").getList(1, 200, { requestKey: null }),

          pb.collection("projects").getList(1, 200, { requestKey: null }),

          pb.collection("clients").getList(1, 200, { requestKey: null }),

          pb.collection("payments").getList(1, 200, { requestKey: null }),

        ]);

      setInvoices(invoiceResult.items);

      setProjects(projectResult.items);

      setClients(clientResult.items);

      setPayments(paymentResult.items);

    } catch (err) {

      console.error("Gagal memuat data invoice:", err);

      setError(

        err?.response?.message ||

          "Data invoice gagal dimuat. Periksa koneksi dan aturan akses PocketBase."

      );

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    loadData();

  }, [loadData]);

  const getProject = useCallback(

    (invoice) =>

      projects.find((project) => project.id === getRelationId(invoice.project)),

    [projects]

  );

  const getClient = useCallback(

    (invoice) =>

      clients.find((client) => client.id === getRelationId(invoice.client)),

    [clients]

  );

  const getProjectName = (invoice) => getProject(invoice)?.project_name || "—";

  const getClientName = (invoice) => {

    const client = getClient(invoice);

    return client?.company_name || client?.client_name || "—";

  };

  const getInvoicePaid = useCallback(

    (invoice) =>

      payments

        .filter(

          (payment) =>

            payment.status === "paid" &&

            getRelationId(payment.invoice) === invoice.id

        )

        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0),

    [payments]

  );

  const getInvoicePayments = useCallback(

    (invoice) => {

      const relatedPayments = payments

        .filter((payment) => getRelationId(payment.invoice) === invoice.id)

        .sort((a, b) => {

          const dateA = new Date(a.payment_date || a.created || 0).getTime() || 0;

          const dateB = new Date(b.payment_date || b.created || 0).getTime() || 0;

          if (dateA !== dateB) return dateA - dateB;

          return String(a.created || a.id).localeCompare(String(b.created || b.id));

        });

      let installmentNumber = 0;

      return relatedPayments.map((payment) => {

        let label = "Pembayaran lainnya";

        if (payment.payment_type === "down_payment") {

          label = "DP Awal";

        } else if (payment.payment_type === "installment") {

          if (payment.status !== "cancelled") installmentNumber += 1;

          label = `Cicilan ke-${Math.max(installmentNumber, 1)}`;

        } else if (payment.payment_type === "final_payment") {

          label = "Pelunasan";

        }

        const statusLabels = {

          paid: "Berhasil dibayar",

          pending: "Menunggu pembayaran",

          cancelled: "Dibatalkan",

        };

        return {

          ...payment,

          displayLabel: label,

          displayStatus: statusLabels[payment.status] || payment.status || "—",

        };

      });

    },

    [payments]

  );

  const getPaymentMethodLabel = (method) => ({

    cash: "Tunai",

    bank_transfer: "Transfer bank",

    e_wallet: "E-wallet",

    other: "Lainnya",

  }[method] || method || "—");

  const getInvoiceRemaining = (invoice) => {

    if (invoice.status === "cancelled") return 0;

    return Math.max(

      0,

      Number(invoice.amount || 0) - getInvoicePaid(invoice)

    );

  };

  const getDisplayStatus = (invoice) => {

    if (invoice.status === "draft" || invoice.status === "cancelled") {

      return (

        invoiceStatuses.find((item) => item.value === invoice.status) || {

          value: invoice.status,

          label: invoice.status || "—",

        }

      );

    }

    const paid = getInvoicePaid(invoice);

    const amount = Number(invoice.amount || 0);

    const remaining = getInvoiceRemaining(invoice);

    if (amount > 0 && remaining <= 0 && paid >= amount) {

      return { value: "paid", label: "Lunas" };

    }

    if (paid > 0 && remaining > 0) {

      return { value: "partially_paid", label: "Dibayar Sebagian" };

    }

    const today = new Date().toISOString().slice(0, 10);

    if (invoice.due_date && dateForInput(invoice.due_date) < today && remaining > 0) {

      return { value: "overdue", label: "Terlambat" };

    }

    return { value: "unpaid", label: "Belum Dibayar" };

  };

  const activeInvoices = invoices.filter(

    (invoice) => !["cancelled", "draft"].includes(invoice.status)

  );

  const totalInvoiceValue = activeInvoices.reduce(

    (sum, invoice) => sum + Number(invoice.amount || 0),

    0

  );

  const totalPaid = activeInvoices.reduce(

    (sum, invoice) => sum + getInvoicePaid(invoice),

    0

  );

  const totalOutstanding = activeInvoices.reduce(

    (sum, invoice) => sum + getInvoiceRemaining(invoice),

    0

  );

  const filteredInvoices = useMemo(() => {

    const keyword = search.trim().toLowerCase();

    return invoices.filter((invoice) => {

      const matchesSearch = [

        invoice.invoice_number,

        invoice.notes,

        getProjectName(invoice),

        getClientName(invoice),

      ]

        .filter(Boolean)

        .some((value) => String(value).toLowerCase().includes(keyword));

      const matchesStatus =

        statusFilter === "all" ||

        getDisplayStatus(invoice).value === statusFilter;

      return matchesSearch && matchesStatus;

    });

  }, [invoices, projects, clients, payments, search, statusFilter]);

  function updateField(event) {

    const { name, value } = event.target;

    setForm((current) => {

      const next = { ...current, [name]: value };

      if (name === "project" && value) {

        const project = projects.find((item) => item.id === value);

        if (project) {
          next.invoice_number = project.project_code || "";
          next.client = getRelationId(project.client);
          next.amount = String(Number(project.contract_value || 0));
        }

      }

      return next;

    });

    setError("");

    setNotice("");

  }

  function openIssueForm(projectId = "") {

    setEditingId(null);

    const project = projects.find((item) => item.id === projectId);

    setForm({

      ...initialForm,

      invoice_number: project?.project_code || "",
      project: project?.id || "",

      client: getRelationId(project?.client),

      amount: project ? String(Number(project.contract_value || 0)) : "",

      status: "unpaid",

      notes: "",

    });

    setError("");

    setNotice("");

    setShowForm(true);

  }

  function openEditForm(invoice) {

    setEditingId(invoice.id);

    setForm({

      invoice_number:
        projects.find((item) => item.id === getRelationId(invoice.project))?.project_code ||
        invoice.invoice_number || "",
      project: getRelationId(invoice.project),

      client: getRelationId(invoice.client),

      issue_date: dateForInput(invoice.issue_date),

      due_date: dateForInput(invoice.due_date),

      amount: String(invoice.amount ?? ""),

      status: invoice.status || "draft",

      notes: invoice.notes || "",

    });

    setError("");

    setNotice("");

    setShowForm(true);

  }

  // Pastikan DP proyek tercatat sebagai satu transaksi untuk invoice terkait.

  // Pemeriksaan memakai daftar pembayaran aktual dari PocketBase agar tetap

  // aman ketika penerbitan invoice sebelumnya berhasil tetapi pencatatan DP gagal.

  // Pastikan DP proyek tercatat satu kali sebagai transaksi menunggu konfirmasi.

  async function ensureDownPaymentForInvoice(invoice, project, issueDate) {

    const downPayment = Number(project.down_payment || 0);

    if (downPayment <= 0) return false;

    const paymentResult = await pb.collection("payments").getFullList({

      requestKey: null,

    });

    const existingDownPayment = paymentResult.some(

      (payment) =>

        getRelationId(payment.invoice) === invoice.id &&

        payment.payment_type === "down_payment" &&

        payment.status !== "cancelled"

    );

    // Jangan membuat transaksi DP kedua untuk invoice yang sama.

    if (existingDownPayment) return false;

    await pb.collection("payments").create({

      invoice: invoice.id,

      project: project.id,

      client: getRelationId(project.client) || "",

      payment_date: toPocketBaseDate(

        issueDate || dateForInput(invoice.issue_date)

      ),

      amount: downPayment,

      payment_type: "down_payment",

      payment_method: "other",

      status: "pending",

      reference_number: "",

      notes: `DP awal proyek ${project.project_code || project.project_name} — menunggu konfirmasi admin`,

    });

    return true;

  }

  async function handleSubmit(event) {

    event.preventDefault();

    if (saving) return;

    setError("");

    setNotice("");

    const project = projects.find((item) => item.id === form.project);

    if (!project) {

      setError("Pilih proyek yang valid sebelum menerbitkan invoice.");

      return;

    }

    const invoiceNumber = String(project.project_code || "").trim();
    const amount = Number(form.amount);

    if (!invoiceNumber) {

      setError("Nomor invoice wajib diisi.");

      return;

    }

    if (!Number.isFinite(amount) || amount < 0) {

      setError("Nominal invoice tidak valid.");

      return;

    }

    setSaving(true);

    try {

      const duplicate = invoices.find(

        (invoice) =>

          String(invoice.invoice_number || "").toLowerCase() === invoiceNumber.toLowerCase() &&

          invoice.id !== editingId

      );

      if (duplicate) {

        setError("Nomor invoice tersebut sudah digunakan. Gunakan nomor yang berbeda.");

        return;

      }

      const payload = {

        invoice_number: invoiceNumber,

        project: project.id,

        client: getRelationId(project.client) || form.client || "",

        issue_date: toPocketBaseDate(form.issue_date),

        due_date: toPocketBaseDate(form.due_date),

        amount,

        status: editingId ? form.status : "unpaid",

        notes: String(form.notes || "").trim(),

      };

      if (editingId) {

        await pb.collection("invoices").update(editingId, payload);

        setNotice(`Invoice ${invoiceNumber} berhasil diperbarui.`);

      } else {

        const createdInvoice = await pb.collection("invoices").create(payload);

        let dpCreated = false;

        let dpError = null;

        try {

          dpCreated = await ensureDownPaymentForInvoice(

            createdInvoice,

            project,

            form.issue_date

          );

        } catch (err) {

          dpError = err;

          console.error("Invoice berhasil dibuat, tetapi pencatatan DP gagal:", err);

        }

        if (dpError) {

          setNotice(`Invoice ${invoiceNumber} berhasil diterbitkan, tetapi transaksi DP gagal dibuat. Periksa menu Pembayaran sebelum mencoba lagi.`);

        } else if (Number(project.down_payment || 0) > 0) {

          setNotice(

            dpCreated

              ? "Invoice diterbitkan. Transaksi DP dibuat dengan status Menunggu konfirmasi. Konfirmasikan setelah pembayaran benar-benar diterima."

              : "Invoice diterbitkan. Transaksi DP yang aktif sudah tercatat sebelumnya."

          );

        } else {

          setNotice("Invoice berhasil diterbitkan.");

        }

      }

      setShowForm(false);

      setEditingId(null);

      setForm(initialForm);

      await loadData();

    } catch (err) {

      console.error("Gagal menyimpan invoice:", err);

      setError(

        err?.response?.message ||

          err?.message ||

          "Invoice gagal disimpan. Periksa koneksi dan aturan akses PocketBase."

      );

    } finally {

      setSaving(false);

    }

  }

  async function handleCreateTrackingLink(invoice) {

    if (trackingLoadingId) return;

    const dpIsPaid = payments.some(

      (payment) =>

        getRelationId(payment.invoice) === invoice.id &&

        payment.payment_type === "down_payment" &&

        payment.status === "paid"

    );

    if (!dpIsPaid) {

      setError(

        "Link tracking baru dapat dibuat setelah pembayaran DP dikonfirmasi."

      );

      return;

    }

    setError("");

    setNotice("");

    setTrackingLoadingId(invoice.id);

    try {

      const result = await pb.send("/api/trimi/tracking/create", {

        method: "POST",

        body: {

          invoiceId: invoice.id,

        },

      });

      if (!result?.success || !result?.token) {

        throw new Error("Server tidak mengembalikan link tracking yang valid.");

      }

      const link = `${window.location.origin}/tracking/${result.token}`;

      setTrackingLinks((current) => ({

        ...current,

        [invoice.id]: link,

      }));

      try {

        await navigator.clipboard.writeText(link);

        setNotice(

          `Link tracking invoice ${invoice.invoice_number} berhasil dibuat dan disalin.`

        );

      } catch {

        setNotice(

          `Link tracking invoice ${invoice.invoice_number} berhasil dibuat. Salin link yang tampil di bawah tombol invoice.`

        );

      }

      // Buka halaman tracking otomatis setelah link berhasil dibuat.
      window.location.assign(link);

    } catch (err) {

      console.error("Gagal membuat link tracking:", err);

      setError(

        err?.response?.message ||

          err?.message ||

          "Link tracking gagal dibuat. Periksa status DP dan koneksi PocketBase."

      );

    } finally {

      setTrackingLoadingId(null);

    }

  }

  function handlePrint(invoice) {

    const project = getProject(invoice);

    const client = getClient(invoice);

    const status = getDisplayStatus(invoice).label;

    const printWindow = window.open("", "\_blank", "width=900,height=700");

    if (!printWindow) {

      setError("Jendela cetak diblokir browser. Izinkan pop-up untuk situs ini.");

      return;

    }

    const escapeHtml = (value) =>

      String(value ?? "").replace(/[&<>"']/g, (character) =>

        ({

          "&": "&amp;",

          "<": "&lt;",

          ">": "&gt;",

          '"': "&quot;",

          "'": "&#39;",

        })[character]

      );

    const invoicePayments = getInvoicePayments(invoice);

    const paymentRows = invoicePayments.length

      ? invoicePayments

          .map(

            (payment, index) => `

              <tr>

                <td class="number">${index + 1}</td>

                <td>

                  <strong>${escapeHtml(payment.displayLabel)}</strong>

                  ${payment.reference_number ? `<div class="subtext">Ref: ${escapeHtml(payment.reference_number)}</div>` : ""}

                  ${payment.notes ? `<div class="subtext">${escapeHtml(payment.notes)}</div>` : ""}

                </td>

                <td>${escapeHtml(formatDate(payment.payment_date))}</td>

                <td>${escapeHtml(getPaymentMethodLabel(payment.payment_method))}</td>

                <td><span class="payment-status">${escapeHtml(payment.displayStatus)}</span></td>

                <td class="money">${escapeHtml(formatCurrency(payment.amount))}</td>

              </tr>`

          )

          .join("")

      : '<tr><td colspan="6" class="empty">Belum ada transaksi pembayaran.</td></tr>';

    const paidAmount = getInvoicePaid(invoice);

    const remainingAmount = getInvoiceRemaining(invoice);

    const clientName = client?.company_name || client?.client_name || "Klien";

    printWindow.document.write(`

      <!doctype html>

      <html lang="id">

      <head>

        <meta charset="UTF-8">

        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Invoice ${escapeHtml(invoice.invoice_number)}</title>

        <style>

          :root { color-scheme: light; }

          \\* { box-sizing: border-box; }

          body { margin: 0; padding: 32px; color: #202938; background: #f3f5f8; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.55; }

          .invoice { max-width: 820px; margin: 0 auto; padding: 38px; background: #fff; border: 1px solid #e5e7eb; }

          .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 28px; padding-bottom: 25px; border-bottom: 3px solid #244d3c; }

          .brand { margin: 0 0 7px; color: #244d3c; font-size: 12px; font-weight: 700; letter-spacing: 2px; }

          h1 { margin: 0; color: #244d3c; font-size: 28px; line-height: 1.1; letter-spacing: 1px; font-family: Georgia, serif; }

          .brand-note { margin: 9px 0 0; color: #64748b; font-size: 11px; }

          .invoice-meta { min-width: 220px; text-align: right; }

          .invoice-number { margin: 0 0 8px; color: #244d3c; font-size: 15px; font-weight: 700; overflow-wrap: anywhere; }

          .meta-row { display: flex; justify-content: space-between; gap: 16px; margin: 4px 0; color: #64748b; font-size: 11.5px; }

          .meta-row strong { color: #202938; font-weight: 600; text-align: right; }

          .status { display: inline-block; margin-top: 8px; padding: 5px 10px; border-radius: 20px; background: #eef7e9; color: #1e5a38; font-size: 10px; font-weight: 700; }

          .section { margin-top: 24px; }

          .section-title { margin: 0 0 12px; color: #64748b; font-size: 10px; font-weight: 700; letter-spacing: 1.3px; text-transform: uppercase; }

          .bill-card { padding: 17px 18px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fbfcf9; }

          .client-name { margin: 0 0 5px; font-size: 15px; font-weight: 700; color: #17251f; }

          .client-details { margin: 0; color: #64748b; white-space: pre-line; overflow-wrap: anywhere; }

          table { width: 100%; border-collapse: collapse; margin-top: 10px; }

          thead { display: table-header-group; }

          th { padding: 11px 9px; background: #f4f6f1; color: #3b4539; font-size: 10px; text-align: left; text-transform: uppercase; letter-spacing: .4px; }

          td { padding: 12px 9px; border-bottom: 1px solid #e8edf3; vertical-align: top; }

          th.money, td.money { text-align: right; white-space: nowrap; }

          th.number, td.number { width: 32px; text-align: center; color: #64748b; }

          .subtext { margin-top: 3px; color: #64748b; font-size: 10px; overflow-wrap: anywhere; }

          .empty { padding: 18px 9px; color: #64748b; text-align: center; }

          .payment-status { color: #475569; font-size: 10px; }

          .totals { width: min(100%, 330px); margin: 22px 0 0 auto; padding: 16px 18px; border: 1px solid #e5e7eb; border-radius: 8px; }

          .total-row { display: flex; justify-content: space-between; gap: 18px; margin: 7px 0; color: #64748b; }

          .total-row strong { color: #202938; text-align: right; white-space: nowrap; }

          .total-row.balance { margin: 12px -18px -16px; padding: 13px 18px; border-radius: 0 0 8px 8px; background: #244d3c; color: #fff; font-weight: 700; }

          .total-row.balance strong { color: #fff; font-size: 15px; }

          .thanks { margin-top: 34px; padding-top: 18px; border-top: 1px solid #e5e7eb; color: #64748b; text-align: center; font-size: 11px; }

          .thanks strong { display: block; margin-bottom: 4px; color: #244d3c; }

          @page { size: A4; margin: 14mm; }

          @media print {

            body { padding: 0; background: #fff; print-color-adjust: exact; -webkit-print-color-adjust: exact; }

            .invoice { max-width: none; padding: 0; border: 0; }

            .section, .totals, .bill-card, tr { break-inside: avoid; page-break-inside: avoid; }

          }

          @media screen and (max-width: 640px) {

            body { padding: 10px; }

            .invoice { padding: 20px; }

            .top { flex-direction: column; }

            .invoice-meta { width: 100%; text-align: left; }

            .meta-row { justify-content: flex-start; }

            .meta-row strong { text-align: left; }

            table { font-size: 10px; }

            th, td { padding: 8px 5px; }

          }

        </style>

      </head>

      <body>

        <main class="invoice">

          <header class="top">

            <div>

              <div style="display: flex; align-items: center; gap: 11px; margin-bottom: 10px;">
                <div style="width: 36px; height: 36px; border-radius: 9px; background: #244d3c; color: #fff; display: grid; place-items: center; font-size: 20px; font-family: Georgia, serif; font-weight: 700;">A</div>
                <div>
                  <div style="margin: 0; color: #244d3c; font-size: 14px; font-weight: 800; letter-spacing: 0.8px;">ASTERX TECH</div>
                  <small style="color: #64748b; font-size: 10px; letter-spacing: 0.5px;">DIGITAL SOLUTIONS</small>
                </div>
              </div>

              <h1>FAKTUR / INVOICE</h1>

              <p class="brand-note">Dokumen tagihan dan riwayat transaksi resmi</p>

            </div>

            <div class="invoice-meta">

              <p class="invoice-number">${escapeHtml(invoice.invoice_number)}</p>

              <div class="meta-row"><span>Tanggal invoice</span><strong>${escapeHtml(formatDate(invoice.issue_date))}</strong></div>

              <div class="meta-row"><span>Jatuh tempo</span><strong>${escapeHtml(formatDate(invoice.due_date))}</strong></div>

              <span class="status">${escapeHtml(status)}</span>

            </div>

          </header>

          <section class="section">

            <h2 class="section-title">Ditagihkan kepada</h2>

            <div class="bill-card">

              <p class="client-name">${escapeHtml(clientName)}</p>

              <p class="client-details">${escapeHtml([client?.email, client?.phone, client?.address].filter(Boolean).join("\n") || "")}</p>

            </div>

          </section>

          <section class="section">

            <h2 class="section-title">Rincian tagihan</h2>

            <table>

              <thead><tr><th>Deskripsi</th><th class="money">Nominal</th></tr></thead>

              <tbody><tr>

                <td><strong>${escapeHtml(project?.project_name || "Tagihan jasa")}</strong>${invoice.notes ? `<div class="subtext">${escapeHtml(invoice.notes)}</div>` : ""}</td>

                <td class="money"><strong>${escapeHtml(formatCurrency(invoice.amount))}</strong></td>

              </tr></tbody>

            </table>

          </section>

          <section class="section">

            <h2 class="section-title">Riwayat pembayaran</h2>

            <table>

              <thead><tr><th class="number">No.</th><th>Rincian pembayaran</th><th>Tanggal</th><th>Metode</th><th>Status</th><th class="money">Nominal</th></tr></thead>

              <tbody>${paymentRows}</tbody>

            </table>

          </section>

          <section class="section" style="margin-top: 22px; padding: 14px 18px; border-radius: 8px; background: #f9fbf7; border: 1px solid #dce8d5;">
            <h3 style="margin: 0 0 6px; font-size: 11px; font-weight: 700; color: #244d3c; text-transform: uppercase; letter-spacing: 0.8px;">Instruksi Rekening Pembayaran</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 11px; color: #2f3b2d;">
              <div>
                <strong>Bank BCA:</strong> 882-019-4821<br>
                <span style="font-size: 10px; color: #6d796b;">a.n. TriMi Digital Studio</span>
              </div>
              <div>
                <strong>Bank Mandiri:</strong> 137-00-2918-4720<br>
                <span style="font-size: 10px; color: #6d796b;">a.n. TriMi Digital Studio</span>
              </div>
            </div>
            <div style="margin-top: 6px; font-size: 10px; color: #64748b;">
              *Mohon sertakan nomor invoice pada berita transfer dan konfirmasikan via WhatsApp.
            </div>
          </section>

          <section class="totals" aria-label="Ringkasan tagihan">

            <div class="total-row"><span>Total tagihan</span><strong>${escapeHtml(formatCurrency(invoice.amount))}</strong></div>

            <div class="total-row"><span>Total terbayar</span><strong>${escapeHtml(formatCurrency(paidAmount))}</strong></div>

            <div class="total-row balance"><span>Sisa tagihan</span><strong>${escapeHtml(formatCurrency(remainingAmount))}</strong></div>

          </section>

          <footer class="thanks"><strong>Terima kasih atas kerja sama dan kepercayaan Anda.</strong>Dokumen ini diterbitkan secara sah dan tercatat di sistem ASTERX TECH.</footer>

        </main>

        <script>window.onload = function () { window.print(); };</script>

      </body>

      </html>

    `);

    printWindow.document.close();

  }

  return (

    <div className="page-container">

      <div className="page-header">

        <div>

          <h1>Invoice</h1>

          <p>Terbitkan tagihan dari nilai kontrak proyek dan pantau pembayaran.</p>

        </div>

        <button

          type="button"

          className="project-primary-button"

          onClick={() => openIssueForm()}

        >

          + Terbitkan Invoice

        </button>

      </div>

      {notice && <div className="project-success" role="status">{notice}</div>}

      {error && !showForm && <div className="project-error" role="alert">{error}</div>}

      <div className="project-summary-grid">

        <div className="project-summary-card">

          <span>Total Nilai Invoice Aktif</span>

          <strong>{formatCurrency(totalInvoiceValue)}</strong>

        </div>

        <div className="project-summary-card">

          <span>Total Pembayaran Diterima</span>

          <strong>{formatCurrency(totalPaid)}</strong>

        </div>

        <div className="project-summary-card">

          <span>Total Sisa Tagihan</span>

          <strong>{formatCurrency(totalOutstanding)}</strong>

        </div>

      </div>

      <div className="project-filters" style={{ display: "flex", gap: "12px", alignItems: "center", margin: "20px 0", flexWrap: "wrap" }}>
        <div className="client-search" style={{ flex: 1, minWidth: "260px", height: "42px" }}>
          <Search size={16} />
          <input
            type="search"
            placeholder="Cari nomor invoice, proyek, atau klien..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ width: "100%", padding: "10px 12px", fontSize: "13px" }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter status invoice"
          style={{ height: "42px", padding: "0 14px", borderRadius: "9px", border: "1px solid #d9dce3", fontSize: "13px", background: "white", color: "#493b3e", fontWeight: "500" }}
        >
          <option value="all">Semua Status</option>
          {invoiceStatuses.map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={loadData}
          style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "42px", padding: "0 16px", borderRadius: "9px", border: "1px solid #d9dce3", background: "white", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#493b3e" }}
        >
          <RefreshCw size={15} />
          <span>Muat Ulang</span>
        </button>
      </div>

      <div className="project-table-container">

        <table className="project-table">

          <thead>

            <tr>

              <th>Nomor Invoice</th><th>Klien</th><th>Proyek</th><th>Tanggal</th>

              <th>Jatuh Tempo</th><th>Nominal</th><th>Terbayar</th>

              <th>Sisa Tagihan</th><th>Status</th><th>Aksi</th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr><td colSpan={10}>Memuat data invoice...</td></tr>

            ) : filteredInvoices.length === 0 ? (

              <tr><td colSpan={10}>Belum ada data invoice.</td></tr>

            ) : filteredInvoices.map((invoice) => {

              const displayStatus = getDisplayStatus(invoice);

              return (

                <tr key={invoice.id}>

                  <td>{invoice.invoice_number}</td>

                  <td>{getClientName(invoice)}</td>

                  <td>{getProjectName(invoice)}</td>

                  <td>{formatDate(invoice.issue_date)}</td>

                  <td>{formatDate(invoice.due_date)}</td>

                  <td>{formatCurrency(invoice.amount)}</td>

                  <td>{formatCurrency(getInvoicePaid(invoice))}</td>

                  <td>{formatCurrency(getInvoiceRemaining(invoice))}</td>

                  <td><span className={`invoice-status invoice-status-${displayStatus.value}`}>{displayStatus.label}</span></td>

                  <td>

                    <div className="project-row-actions">
                      <button
                        type="button"
                        className="project-icon-button"
                        onClick={() => setSelectedInvoiceId(invoice.id)}
                        style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                      >
                        <Eye size={13} />
                        <span>Rincian</span>
                      </button>

                      <button
                        type="button"
                        className="project-icon-button"
                        onClick={() => handlePrint(invoice)}
                        style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                      >
                        <Printer size={13} />
                        <span>Cetak</span>
                      </button>

                  {payments.some(

                    (payment) =>

                      getRelationId(payment.invoice) === invoice.id &&

                      payment.payment_type === "down_payment" &&

                      payment.status === "paid"

                  ) && (

                    <button

                      type="button"

                      className="project-icon-button"

                      onClick={() => handleCreateTrackingLink(invoice)}

                      disabled={trackingLoadingId === invoice.id}

                    >

                      {trackingLoadingId === invoice.id

                        ? "Membuat..."

                        : "Buat Link Tracking"}

                    </button>

                  )}

                  {trackingLinks[invoice.id] && (

                    <div style={{ minWidth: "220px", maxWidth: "320px" }}>

                      <input

                        type="text"

                        readOnly

                        value={trackingLinks[invoice.id]}

                        onFocus={(event) => event.target.select()}

                        aria-label={`Link tracking ${invoice.invoice_number}`}

                        style={{ width: "100%", marginTop: "6px" }}

                      />

                      <button

                        type="button"

                        className="project-icon-button"

                        onClick={async () => {

                          try {

                            await navigator.clipboard.writeText(

                              trackingLinks[invoice.id]

                            );

                            setNotice("Link tracking berhasil disalin.");

                            setError("");

                          } catch {

                            setError(

                              "Gagal menyalin otomatis. Pilih link di kotak lalu tekan Ctrl+C."

                            );

                          }

                        }}

                      >

                        Salin Link

                      </button>

                    </div>

                  )}

                    </div>

                  </td>

                </tr>

              );

            })}

          </tbody>

        </table>

      </div>

      {selectedInvoiceId && (() => {

        const selectedInvoice = invoices.find((item) => item.id === selectedInvoiceId);

        if (!selectedInvoice) return null;

        const detailPayments = getInvoicePayments(selectedInvoice);

        return (

          <div

            className="project-modal-overlay"

            onMouseDown={(event) => {

              if (event.target === event.currentTarget) setSelectedInvoiceId(null);

            }}

          >

            <section className="project-modal" role="dialog" aria-modal="true" aria-labelledby="invoice-payment-detail-title">

              <div className="project-modal-header">

                <div>

                  <h2 id="invoice-payment-detail-title">Rincian Pembayaran</h2>

                  <p>{selectedInvoice.invoice_number} · {getProjectName(selectedInvoice)}</p>

                </div>

                <button type="button" className="project-modal-close" onClick={() => setSelectedInvoiceId(null)} aria-label="Tutup rincian">×</button>

              </div>

              <div className="project-summary-grid">

                <div className="project-summary-card"><span>Total Tagihan</span><strong>{formatCurrency(selectedInvoice.amount)}</strong></div>

                <div className="project-summary-card"><span>Total Terbayar</span><strong>{formatCurrency(getInvoicePaid(selectedInvoice))}</strong></div>

                <div className="project-summary-card"><span>Sisa Tagihan</span><strong>{formatCurrency(getInvoiceRemaining(selectedInvoice))}</strong></div>

              </div>

              <div className="project-table-container">

                <table className="project-table">

                  <thead><tr><th>No.</th><th>Rincian Pembayaran</th><th>Tanggal</th><th>Metode</th><th>Status</th><th>Nominal</th></tr></thead>

                  <tbody>

                    {detailPayments.length === 0 ? (

                      <tr><td colSpan={6}>Belum ada transaksi pembayaran untuk invoice ini.</td></tr>

                    ) : detailPayments.map((payment, index) => (

                      <tr key={payment.id}>

                        <td>{index + 1}</td>

                        <td>

                          <strong>{payment.displayLabel}</strong>

                          {payment.reference_number && <div><small>Ref: {payment.reference_number}</small></div>}

                          {payment.notes && <div><small>{payment.notes}</small></div>}

                        </td>

                        <td>{formatDate(payment.payment_date)}</td>

                        <td>{getPaymentMethodLabel(payment.payment_method)}</td>

                        <td>{payment.displayStatus}</td>

                        <td>{formatCurrency(payment.amount)}</td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              <div className="project-form-actions" style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => handlePrint(selectedInvoice)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 18px", borderRadius: "8px", border: "1px solid #244d3c", background: "#f5f9f3", color: "#244d3c", fontWeight: "600", cursor: "pointer" }}
                >
                  <Printer size={16} />
                  <span>Cetak / PDF Invoice</span>
                </button>
                <button
                  type="button"
                  className="project-primary-button"
                  onClick={() => setSelectedInvoiceId(null)}
                >
                  Tutup
                </button>
              </div>

            </section>

          </div>

        );

      })()}

      {showForm && (

        <div

          className="project-modal-overlay"

          onMouseDown={(event) => {

            if (event.target === event.currentTarget && !saving) setShowForm(false);

          }}

        >

          <section className="project-modal" role="dialog" aria-modal="true" aria-labelledby="invoice-form-title">

            <div className="project-modal-header">

              <h2 id="invoice-form-title">{editingId ? "Edit Invoice" : "Terbitkan Invoice"}</h2>

              <button type="button" className="project-modal-close" onClick={() => setShowForm(false)} disabled={saving} aria-label="Tutup form">×</button>

            </div>

            {error && <div className="project-error" role="alert">{error}</div>}

            <form onSubmit={handleSubmit}>

              <div className="project-form-grid">

                <label className="project-field">

                  Nomor Invoice

                  <input type="text" name="invoice_number" value={form.invoice_number} readOnly maxLength={100} required />
                  <small>Nomor invoice otomatis mengikuti kode proyek yang dipilih.</small>

                </label>

                <label className="project-field">

                  Proyek

                  <select name="project" value={form.project} onChange={updateField} required disabled={Boolean(editingId)}>

                    <option value="">Pilih proyek</option>

                    {projects.map((project) => (

                      <option key={project.id} value={project.id}>

                        {project.project_code} — {project.project_name}

                      </option>

                    ))}

                  </select>

                </label>

                <label className="project-field">

                  Klien

                  <select name="client" value={form.client} onChange={updateField} disabled>

                    <option value="">Pilih klien</option>

                    {clients.map((client) => (

                      <option key={client.id} value={client.id}>

                        {client.company_name ? `${client.company_name} — ${client.client_name}` : client.client_name}

                      </option>

                    ))}

                  </select>

                </label>

                <label className="project-field">

                  Status Invoice

                  <select name="status" value={form.status} onChange={updateField} disabled={!editingId} required>

                    {invoiceStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}

                  </select>

                  {!editingId && <small>Status invoice baru otomatis menjadi Belum Dibayar.</small>}

                </label>

                <label className="project-field">

                  Tanggal Invoice

                  <input type="date" name="issue_date" value={form.issue_date} onChange={updateField} required />

                </label>

                <label className="project-field">

                  Jatuh Tempo

                  <input type="date" name="due_date" value={form.due_date} onChange={updateField} />

                </label>

                <label className="project-field project-field-full">

                  Nominal Tagihan (Rp)

                  <input type="number" name="amount" min="0" step="1" value={form.amount} readOnly={!editingId} onChange={updateField} required />

                  {!editingId && <small>Nominal mengikuti nilai kontrak pada Project.</small>}

                </label>

                <label className="project-field project-field-full">

                  Catatan

                  <textarea name="notes" value={form.notes} onChange={updateField} rows={3} maxLength={5000} />

                </label>

              </div>

              <div className="project-form-actions">

                <button type="button" onClick={() => setShowForm(false)} disabled={saving}>Batal</button>

                <button type="submit" className="project-primary-button" disabled={saving}>

                  {saving ? "Memproses..." : editingId ? "Simpan Perubahan" : "Terbitkan Invoice"}

                </button>

              </div>

            </form>

          </section>

        </div>

      )}

    </div>

  );

}
