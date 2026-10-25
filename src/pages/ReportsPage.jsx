import { useCallback, useEffect, useMemo, useState } from "react";
import { pb } from "../lib/pocketbase";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const statusLabels = {
  planning: "Perencanaan",
  in_progress: "Berjalan",
  review: "Dalam Review",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

function formatRupiah(value) {
  return currency.format(Number(value) || 0);
}

function relationId(value) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function sum(items, field) {
  return items.reduce((total, item) => total + (Number(item[field]) || 0), 0);
}

function getStatusLabel(status) {
  if (!status) return "Belum ditentukan";
  return statusLabels[status] || String(status).replaceAll("_", " ");
}

function paymentDateOnly(payment) {
  return String(payment.payment_date || payment.created || "").slice(0, 10);
}

function monthKey(dateString) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ? dateString.slice(0, 7)
    : "";
}

function formatMonth(month) {
  const [year, monthNumber] = month.split("-");
  const date = new Date(Number(year), Number(monthNumber) - 1, 1);
  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function isPaymentInPeriod(payment, startDate, endDate) {
  const date = paymentDateOnly(payment);
  if (!date) return false;
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
}

function isOverdue(invoice, outstanding, today) {
  if (!invoice.due_date || outstanding <= 0) return false;
  const dueDate = new Date(`${String(invoice.due_date).slice(0, 10)}T00:00:00`);
  return !Number.isNaN(dueDate.getTime()) && dueDate < today;
}

function StatusBadge({ status }) {
  const cancelled = status === "cancelled";
  const completed = status === "completed";

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: 20,
        fontSize: 12,
        background: cancelled ? "#fee2e2" : completed ? "#dcfce7" : "#e0e7ff",
        color: cancelled ? "#991b1b" : completed ? "#166534" : "#3730a3",
        whiteSpace: "nowrap",
      }}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export default function ReportsPage() {
  const [report, setReport] = useState({
    contractValue: 0,
    received: 0,
    invoiceTotal: 0,
    outstanding: 0,
    vendorCost: 0,
    operationalExpense: 0,
    overdue: 0,
    overdueCount: 0,
    projects: [],
    payments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [periodError, setPeriodError] = useState("");

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [projects, payments, invoices, vendors, operationalExpenses] = await Promise.all([
        pb.collection("projects").getFullList({ requestKey: null }),
        pb.collection("payments").getFullList({ requestKey: null }),
        pb.collection("invoices").getFullList({ requestKey: null }),
        pb.collection("project_vendors").getFullList({ requestKey: null }),
        pb.collection("operational_expenses").getFullList({ requestKey: null }),
      ]);

      const paidPayments = payments.filter((payment) => payment.status === "paid");
      const activeInvoices = invoices.filter(
        (invoice) => !["cancelled", "draft"].includes(invoice.status)
      );
      const activeVendorLinks = vendors.filter((vendor) => vendor.status !== "cancelled");
      const invoiceProjectById = new Map(
        activeInvoices.map((invoice) => [invoice.id, relationId(invoice.project)])
      );
      const paidPaymentsWithProject = paidPayments.map((payment) => ({
        ...payment,
        __projectId:
          relationId(payment.project) ||
          invoiceProjectById.get(relationId(payment.invoice)) ||
          "",
      }));

      // Hitung seluruh pembayaran lunas per invoice agar sisa tagihan tetap akurat.
      const paidByInvoice = new Map();
      paidPayments.forEach((payment) => {
        const invoiceId = relationId(payment.invoice);
        if (!invoiceId) return;
        paidByInvoice.set(
          invoiceId,
          (paidByInvoice.get(invoiceId) || 0) + (Number(payment.amount) || 0)
        );
      });

      const outstandingByInvoice = new Map();
      activeInvoices.forEach((invoice) => {
        const paid = paidByInvoice.get(invoice.id) || 0;
        outstandingByInvoice.set(
          invoice.id,
          Math.max(0, (Number(invoice.amount) || 0) - paid)
        );
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const overdueInvoices = activeInvoices.filter((invoice) =>
        isOverdue(invoice, outstandingByInvoice.get(invoice.id) || 0, today)
      );
      const overdueTotal = overdueInvoices.reduce(
        (total, invoice) => total + (outstandingByInvoice.get(invoice.id) || 0),
        0
      );

      const projectRows = projects.map((project) => {
        const projectInvoices = activeInvoices.filter(
          (invoice) => relationId(invoice.project) === project.id
        );
        const projectPayments = paidPaymentsWithProject.filter(
          (payment) => payment.__projectId === project.id
        );
        const projectVendorLinks = activeVendorLinks.filter(
          (vendor) => relationId(vendor.project) === project.id
        );
        const projectOperationalExpenses = operationalExpenses.filter(
          (expense) => relationId(expense.project) === project.id
        );
        const projectOperationalExpense = sum(projectOperationalExpenses, "amount");
        const projectOverdueInvoices = projectInvoices.filter((invoice) =>
          isOverdue(invoice, outstandingByInvoice.get(invoice.id) || 0, today)
        );

        return {
          id: project.id,
          name: project.project_name || "Proyek tanpa nama",
          code: project.project_code || "—",
          status: project.status || "",
          contractValue: Number(project.contract_value) || 0,
          received: sum(projectPayments, "amount"),
          invoiceTotal: sum(projectInvoices, "amount"),
          outstanding: projectInvoices.reduce(
            (total, invoice) => total + (outstandingByInvoice.get(invoice.id) || 0),
            0
          ),
          vendorCost: sum(projectVendorLinks, "cost"),
          operationalExpense: projectOperationalExpense,
          estimatedProfit: (Number(project.contract_value) || 0) -
            sum(projectVendorLinks, "cost") - projectOperationalExpense,
          overdue: projectOverdueInvoices.reduce(
            (total, invoice) => total + (outstandingByInvoice.get(invoice.id) || 0),
            0
          ),
          overdueCount: projectOverdueInvoices.length,
        };
      });

      setReport({
        contractValue: sum(projects, "contract_value"),
        received: sum(paidPayments, "amount"),
        invoiceTotal: sum(activeInvoices, "amount"),
        outstanding: Array.from(outstandingByInvoice.values()).reduce(
          (total, value) => total + value,
          0
        ),
        vendorCost: sum(activeVendorLinks, "cost"),
        operationalExpense: sum(operationalExpenses, "amount"),
        overdue: overdueTotal,
        overdueCount: overdueInvoices.length,
        projects: projectRows,
        payments: paidPaymentsWithProject,
      });
    } catch (err) {
      console.error("Gagal memuat laporan:", err);
      setError(
        err?.response?.message ||
          "Laporan gagal dimuat. Periksa koneksi dan API Rules PocketBase."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const periodPayments = useMemo(
    () => report.payments.filter((payment) =>
      isPaymentInPeriod(payment, appliedStartDate, appliedEndDate)
    ),
    [report.payments, appliedStartDate, appliedEndDate]
  );

  const projectRows = useMemo(() => {
    return report.projects.map((project) => {
      const paymentsForProject = periodPayments.filter(
        (payment) => payment.__projectId === project.id
      );
      return { ...project, periodReceived: sum(paymentsForProject, "amount") };
    });
  }, [report.projects, periodPayments]);

  const periodReceived = sum(periodPayments, "amount");
  const periodLabel = appliedStartDate || appliedEndDate
    ? `${appliedStartDate || "Awal data"} s.d. ${appliedEndDate || "Hari ini"}`
    : "Semua periode";

  const monthlyCashflow = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.push({ key, label: formatMonth(key), total: 0 });
    }
    const totals = new Map(months.map((month) => [month.key, 0]));
    report.payments.forEach((payment) => {
      const key = monthKey(paymentDateOnly(payment));
      if (totals.has(key)) {
        totals.set(key, totals.get(key) + (Number(payment.amount) || 0));
      }
    });
    return months.map((month) => ({ ...month, total: totals.get(month.key) || 0 }));
  }, [report.payments]);

  const maxMonthlyCashflow = Math.max(
    1,
    ...monthlyCashflow.map((month) => month.total)
  );

  const projectMargins = useMemo(
    () => report.projects.map((project) => ({
      ...project,
      estimatedMargin: project.contractValue - project.vendorCost - project.operationalExpense,
    })),
    [report.projects]
  );

  function applyPeriod() {
    if (startDate && endDate && startDate > endDate) {
      setPeriodError("Tanggal mulai tidak boleh melewati tanggal akhir.");
      return;
    }
    setPeriodError("");
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  }

  function resetPeriod() {
    setStartDate("");
    setEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setPeriodError("");
  }

  function exportCsv() {
    const headers = [
      "Kode Proyek",
      "Nama Proyek",
      "Status Proyek",
      "Nilai Kontrak",
      "Pembayaran Diterima Periode",
      "Total Invoice Aktif",
      "Sisa Tagihan",
      "Tagihan Terlambat",
      "Jumlah Invoice Terlambat",
      "Biaya Vendor Tercatat",
      "Biaya Operasional Proyek",
      "Estimasi Margin",
    ];
    const rows = projectRows.map((project) => [
      project.code,
      project.name,
      getStatusLabel(project.status),
      project.contractValue,
      project.periodReceived,
      project.invoiceTotal,
      project.outstanding,
      project.overdue,
      project.overdueCount,
      project.vendorCost,
      project.operationalExpense,
      project.contractValue - project.vendorCost - project.operationalExpense,
    ]);
    const csv = [
      ["Laporan Keuangan TriMi"],
      [`Periode pembayaran: ${periodLabel}`],
      [],
      headers,
      ...rows,
      [],
      ["Total pembayaran diterima pada periode", periodReceived],
      ["Total biaya operasional keseluruhan", report.operationalExpense],
      ["Catatan", "Biaya operasional pada margin proyek hanya menghitung pengeluaran yang terhubung ke proyek. Total biaya operasional keseluruhan juga mencakup pengeluaran umum tanpa proyek."],
    ]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const suffix = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `laporan-keuangan-trimi-${suffix}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const cards = [
    { label: "Total Nilai Kontrak", value: report.contractValue },
    { label: "Pembayaran Diterima (Periode)", value: periodReceived, detail: periodLabel },
    { label: "Total Invoice Aktif", value: report.invoiceTotal },
    { label: "Sisa Tagihan Klien", value: report.outstanding },
    {
      label: "Tagihan Terlambat",
      value: report.overdue,
      detail: `${report.overdueCount} invoice terlambat`,
      overdue: true,
    },
    { label: "Biaya Vendor Tercatat", value: report.vendorCost },
    { label: "Biaya Operasional", value: report.operationalExpense },
  ];

  return (
    <div className="page-container">
      <div className="page-heading">
        <span className="eyebrow">MANAJEMEN BISNIS</span>
        <h1>Laporan Keuangan</h1>
        <p className="muted">Ringkasan kontrak, penerimaan, tagihan, biaya vendor, dan biaya operasional.</p>
      </div>

      <section
        style={{
          marginBottom: 20,
          padding: 16,
          border: "1px solid var(--border-color, #e5e7eb)",
          borderRadius: 12,
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 17 }}>Filter Periode Pembayaran</h2>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "end", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="muted">Dari tanggal</span>
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="muted">Sampai tanggal</span>
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>
          <button type="button" onClick={applyPeriod} disabled={loading}>Terapkan Periode</button>
          <button type="button" onClick={resetPeriod} disabled={loading}>Reset</button>
          <button type="button" onClick={exportCsv} disabled={loading}>Export CSV</button>
          <button type="button" onClick={loadReport} disabled={loading}>
            {loading ? "Memuat..." : "Muat Ulang Laporan"}
          </button>
        </div>
        {periodError && <p role="alert" style={{ color: "crimson", marginBottom: 0 }}>{periodError}</p>}
        <p className="muted" style={{ marginBottom: 0, marginTop: 10, fontSize: 12 }}>
          Filter periode hanya memengaruhi pembayaran berstatus lunas berdasarkan tanggal transaksi. Nilai kontrak, invoice, sisa tagihan, keterlambatan, dan biaya vendor tetap menampilkan keseluruhan data saat ini.
        </p>
      </section>

      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
      {loading && <p>Memuat laporan keuangan...</p>}

      {!loading && !error && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 28,
            }}
          >
            {cards.map((card) => (
              <article
                key={card.label}
                className="dashboard-card"
                style={{
                  padding: 20,
                  border: "1px solid var(--border-color, #e5e7eb)",
                  borderRadius: 12,
                }}
              >
                <p className="muted">{card.label}</p>
                <h2 style={{ color: card.overdue ? "#b91c1c" : undefined }}>
                  {formatRupiah(card.value)}
                </h2>
                {card.detail && <p className="muted" style={{ marginTop: 6, fontSize: 12 }}>{card.detail}</p>}
              </article>
            ))}
          </div>

          <section style={{ marginBottom: 28 }}>
            <h2>Arus Kas Masuk Bulanan</h2>
            <p className="muted" style={{ marginTop: -6, marginBottom: 14 }}>
              Total pembayaran lunas selama 6 bulan terakhir, berdasarkan tanggal transaksi. Grafik ini tidak mengikuti filter periode di atas.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, minmax(70px, 1fr))",
                alignItems: "end",
                gap: 12,
                minHeight: 220,
                padding: 16,
                border: "1px solid var(--border-color, #e5e7eb)",
                borderRadius: 12,
                overflowX: "auto",
              }}
            >
              {monthlyCashflow.map((month) => (
                <div key={month.key} style={{ minWidth: 70, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "end", gap: 8, height: 185 }}>
                  <div style={{ fontSize: 11, lineHeight: 1.3, overflowWrap: "anywhere" }}>
                    {formatRupiah(month.total)}
                  </div>
                  <div
                    title={`${month.label}: ${formatRupiah(month.total)}`}
                    style={{
                      width: "min(100%, 54px)",
                      height: `${Math.max(4, (month.total / maxMonthlyCashflow) * 105)}px`,
                      margin: "0 auto",
                      borderRadius: "6px 6px 0 0",
                      background: "var(--primary-color, #4f46e5)",
                      opacity: month.total > 0 ? 1 : 0.25,
                    }}
                  />
                  <div className="muted" style={{ fontSize: 12 }}>{month.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 28 }}>
            <h2>Estimasi Margin per Proyek</h2>
            <p className="muted" style={{ marginTop: -6, marginBottom: 12 }}>
              Estimasi indikatif: nilai kontrak dikurangi biaya vendor dan biaya operasional yang terhubung ke proyek. Belum merupakan laba bersih karena pajak, biaya lain, dan pengakuan pendapatan belum diperhitungkan.
            </p>
            <div style={{ overflowX: "auto", border: "1px solid var(--border-color, #e5e7eb)", borderRadius: 12 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
                <thead>
                  <tr>
                    {["Proyek", "Nilai Kontrak", "Biaya Vendor", "Biaya Operasional Proyek", "Estimasi Margin", "Margin (%)"].map((heading) => (
                      <th key={heading} style={{ textAlign: "left", padding: 12, borderBottom: "1px solid var(--border-color, #e5e7eb)", whiteSpace: "nowrap" }}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projectMargins.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: 16 }}>Belum ada data proyek.</td></tr>
                  ) : projectMargins.map((project) => {
                    const marginPercent = project.contractValue > 0
                      ? (project.estimatedMargin / project.contractValue) * 100
                      : null;
                    return (
                      <tr key={project.id}>
                        <td style={{ padding: 12 }}>
                          <strong>{project.name}</strong>
                          <div className="muted">{project.code}</div>
                        </td>
                        <td style={{ padding: 12, whiteSpace: "nowrap" }}>{formatRupiah(project.contractValue)}</td>
                        <td style={{ padding: 12, whiteSpace: "nowrap" }}>{formatRupiah(project.vendorCost)}</td>
                        <td style={{ padding: 12, whiteSpace: "nowrap" }}>{formatRupiah(project.operationalExpense)}</td>
                        <td style={{ padding: 12, whiteSpace: "nowrap", color: project.estimatedMargin < 0 ? "#b91c1c" : undefined }}>{formatRupiah(project.estimatedMargin)}</td>
                        <td style={{ padding: 12, whiteSpace: "nowrap" }}>{marginPercent === null ? "—" : `${marginPercent.toFixed(1).replace(".", ",")}%`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>Rincian Keuangan per Proyek</h2>
            <p className="muted" style={{ marginTop: -6, marginBottom: 12 }}>
              Pembayaran diterima pada tabel mengikuti periode: {periodLabel}.
            </p>
            <div style={{ overflowX: "auto", border: "1px solid var(--border-color, #e5e7eb)", borderRadius: 12 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1320 }}>
                <thead>
                  <tr>
                    {[
                      "Proyek",
                      "Status Proyek",
                      "Nilai Kontrak",
                      "Pembayaran Diterima (Periode)",
                      "Total Invoice",
                      "Sisa Tagihan",
                      "Tagihan Terlambat",
                      "Biaya Vendor",
                      "Biaya Operasional Proyek",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{ textAlign: "left", padding: 12, borderBottom: "1px solid var(--border-color, #e5e7eb)", whiteSpace: "nowrap" }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projectRows.length === 0 ? (
                    <tr><td colSpan={9} style={{ padding: 16 }}>Belum ada data proyek.</td></tr>
                  ) : (
                    projectRows.map((project) => (
                      <tr key={project.id}>
                        <td style={{ padding: 12 }}>
                          <strong>{project.name}</strong>
                          <div className="muted">{project.code}</div>
                        </td>
                        <td style={{ padding: 12 }}><StatusBadge status={project.status} /></td>
                        <td style={{ padding: 12, whiteSpace: "nowrap" }}>{formatRupiah(project.contractValue)}</td>
                        <td style={{ padding: 12, whiteSpace: "nowrap" }}>{formatRupiah(project.periodReceived)}</td>
                        <td style={{ padding: 12, whiteSpace: "nowrap" }}>{formatRupiah(project.invoiceTotal)}</td>
                        <td style={{ padding: 12, whiteSpace: "nowrap" }}>{formatRupiah(project.outstanding)}</td>
                        <td
                          style={{
                            padding: 12,
                            whiteSpace: "nowrap",
                            color: project.overdue > 0 ? "#b91c1c" : undefined,
                          }}
                        >
                          {formatRupiah(project.overdue)}
                          {project.overdueCount > 0 && <div style={{ fontSize: 12 }}>{project.overdueCount} invoice</div>}
                        </td>
                        <td style={{ padding: 12, whiteSpace: "nowrap" }}>{formatRupiah(project.vendorCost)}</td>
                        <td style={{ padding: 12, whiteSpace: "nowrap" }}>{formatRupiah(project.operationalExpense)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <p className="muted" style={{ marginTop: 20 }}>
            Catatan: tagihan terlambat dihitung dari invoice aktif yang memiliki due_date sebelum hari ini dan masih memiliki sisa tagihan. Pembayaran yang mengurangi tagihan harus berstatus paid dan terhubung ke invoice terkait. Biaya operasional proyek hanya menghitung pengeluaran yang dikaitkan langsung ke proyek; pengeluaran tanpa proyek masuk ke total biaya operasional keseluruhan, bukan margin proyek tertentu. Estimasi margin menggunakan nilai kontrak dikurangi biaya vendor dan biaya operasional proyek, bukan laba bersih final. Pembayaran pada laporan periode menggunakan payment_date; jika kosong, tanggal created dipakai sebagai cadangan.
          </p>
        </>
      )}
    </div>
  );
}
