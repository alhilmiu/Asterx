import { useCallback, useEffect, useState } from "react";

import { pb } from "../lib/pocketbase";



const initialForm = {

  invoice: "",

  project: "",

  client: "",

  payment_date: new Date().toISOString().slice(0, 10),

  amount: "",

  payment_type: "down_payment",

  payment_method: "bank_transfer",

  status: "pending",

  reference_number: "",

  notes: "",

};



const paymentTypes = [

  { value: "down_payment", label: "Uang Muka (DP)" },

  { value: "installment", label: "Cicilan" },

  { value: "final_payment", label: "Pelunasan" },

  { value: "other", label: "Lainnya" },

];



const paymentMethods = [

  { value: "cash", label: "Tunai" },

  { value: "bank_transfer", label: "Transfer Bank" },

  { value: "e_wallet", label: "E-Wallet" },

  { value: "other", label: "Lainnya" },

];



const paymentStatuses = [

  { value: "pending", label: "Menunggu" },

  { value: "paid", label: "Berhasil" },

  { value: "cancelled", label: "Dibatalkan" },

];



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



function getRelationId(value) {

  return Array.isArray(value) ? value[0] || "" : value || "";

}



export default function PaymentsPage() {

  const [payments, setPayments] = useState([]);

  const [invoices, setInvoices] = useState([]);

  const [projects, setProjects] = useState([]);

  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(initialForm);



  const loadData = useCallback(async () => {

    setLoading(true);

    setError("");



    try {

      const [

        paymentResult,

        invoiceResult,

        projectResult,

        clientResult,

      ] = await Promise.all([

        pb.collection("payments").getList(1, 200, {

          requestKey: null,

        }),

        pb.collection("invoices").getList(1, 200, {

          requestKey: null,

        }),

        pb.collection("projects").getList(1, 200, {

          requestKey: null,

        }),

        pb.collection("clients").getList(1, 200, {

          requestKey: null,

        }),

      ]);



      setPayments(paymentResult.items);

      setInvoices(invoiceResult.items);

      setProjects(projectResult.items);

      setClients(clientResult.items);

    } catch (err) {

      console.error("Gagal memuat data pembayaran:", err);

      setError(

        err?.response?.message ||

          "Data gagal dimuat. Periksa koneksi dan aturan akses PocketBase."

      );

    } finally {

      setLoading(false);

    }

  }, []);



  useEffect(() => {

    loadData();

  }, [loadData]);



  function updateField(event) {

    const { name, value } = event.target;



    setForm((current) => {

      const next = { ...current, [name]: value };



      if (name === "invoice" && value) {

        const selectedInvoice = invoices.find(

          (invoice) => invoice.id === value

        );



        if (selectedInvoice) {

          next.project = getRelationId(selectedInvoice.project);

          next.client = getRelationId(selectedInvoice.client);

        }

      }



      if (name === "project" && value) {

        const selectedProject = projects.find(

          (project) => project.id === value

        );



        if (selectedProject?.client) {

          next.client = getRelationId(selectedProject.client);

        }

      }



      return next;

    });

  }



  function openCreateForm() {

    setEditingId(null);

    setForm({

      ...initialForm,

      payment_date: new Date().toISOString().slice(0, 10),

    });

    setError("");

    setShowForm(true);

  }



  function openEditForm(payment) {

    setEditingId(payment.id);



    setForm({

      invoice: getRelationId(payment.invoice),

      project: getRelationId(payment.project),

      client: getRelationId(payment.client),

      payment_date: payment.payment_date

        ? payment.payment_date.slice(0, 10)

        : "",

      amount: String(payment.amount ?? ""),

      payment_type: payment.payment_type || "other",

      payment_method: payment.payment_method || "other",

      status: payment.status || "pending",

      reference_number: payment.reference_number || "",

      notes: payment.notes || "",

    });



    setError("");

    setShowForm(true);

  }



  async function handleSubmit(event) {

    event.preventDefault();

    setSaving(true);

    setError("");
    setSuccess("");

    const amount = Number(form.amount);



    if (!Number.isFinite(amount) || amount <= 0) {

      setError("Nominal pembayaran harus lebih besar dari Rp0.");

      setSaving(false);

      return;

    }



    // DP yang dikonfirmasi harus terhubung ke invoice.
    if (form.status === "paid" && form.payment_type === "down_payment" && !form.invoice) {
      setError("Pilih invoice untuk pembayaran DP yang sudah dibayar agar Order Tracking dapat dibuat.");
      setSaving(false);
      return;
    }

    const selectedInvoice = invoices.find((invoice) => invoice.id === form.invoice);
    const existingPayment = editingId
      ? payments.find((payment) => payment.id === editingId)
      : null;
    const shouldCreateTracking =
      form.status === "paid" &&
      form.payment_type === "down_payment" &&
      (!existingPayment ||
        existingPayment.status !== "paid" ||
        existingPayment.payment_type !== "down_payment");

    const payload = {
      invoice: form.invoice || "",
      project: form.project || "",
      client: form.client || "",
      payment_date: form.payment_date
        ? `${form.payment_date} 00:00:00.000Z`
        : "",
      amount,
      payment_type: form.payment_type,
      payment_method: form.payment_method,
      status: form.status,
      reference_number: form.reference_number.trim(),
      notes: form.notes.trim(),
    };


    // Jika invoice dipilih, periksa agar total pembayaran berhasil

    // tidak melebihi total tagihan invoice.

    if (selectedInvoice && form.status === "paid") {

      const alreadyPaid = payments

        .filter(

          (payment) =>

            getRelationId(payment.invoice) === selectedInvoice.id &&

            payment.status === "paid" &&

            payment.id !== editingId

        )

        .reduce(

          (sum, payment) => sum + Number(payment.amount || 0),

          0

        );



      const remaining = Math.max(

        0,

        Number(selectedInvoice.amount || 0) - alreadyPaid

      );



      if (amount > remaining) {

        setError(

          `Pembayaran melebihi sisa tagihan ${formatCurrency(remaining)}. Periksa nominal atau invoice yang dipilih.`

        );

        setSaving(false);

        return;

      }

    }



    try {

      if (editingId) {
        await pb.collection("payments").update(editingId, payload);
      } else {
        await pb.collection("payments").create(payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(initialForm);

      // Trigger tracking only when a down payment first becomes Paid.
      if (shouldCreateTracking && form.invoice) {
        try {
          const trackingResult = await pb.send("/api/trimi/tracking/create", {
            method: "POST",
            body: { invoiceId: form.invoice },
          });
          const trackingUrl = `${window.location.origin}${trackingResult.trackingPath}`;
          setSuccess(`Pembayaran tersimpan. Order Tracking berhasil dibuat: ${trackingUrl}`);
          window.alert(`DP berhasil dikonfirmasi dan Order Tracking dibuat.

Link: ${trackingUrl}`);
        } catch (trackingError) {
          console.error("Pembayaran tersimpan, tetapi tracking gagal dibuat:", trackingError);
          setError(`Pembayaran berhasil disimpan, tetapi Order Tracking gagal dibuat: ${trackingError?.response?.message || trackingError?.message || "Kesalahan tidak diketahui"}. Periksa invoice, status DP, dan aturan akses PocketBase.`);
        }
      } else {
        setSuccess("Pembayaran berhasil disimpan.");
      }

      await loadData();

    } catch (err) {

      console.error("Gagal menyimpan pembayaran:", err);



      const fieldErrors = err?.response?.data;

      const detail = fieldErrors

        ? Object.entries(fieldErrors)

            .map(

              ([field, info]) =>

                `${field}: ${info.message || "tidak valid"}`

            )

            .join(" | ")

        : "";



      setError(

        detail ||

          err?.response?.message ||

          "Pembayaran gagal disimpan. Periksa field dan aturan akses PocketBase."

      );

    } finally {

      setSaving(false);

    }

  }



  async function handleDelete(payment) {

    const confirmed = window.confirm(

      `Hapus transaksi pembayaran ${formatCurrency(payment.amount)}? Tindakan ini tidak dapat dibatalkan.`

    );



    if (!confirmed) return;



    setError("");



    try {

      await pb.collection("payments").delete(payment.id);

      await loadData();

    } catch (err) {

      console.error("Gagal menghapus pembayaran:", err);

      setError(

        err?.response?.message ||

          "Pembayaran gagal dihapus. Pastikan akun memiliki izin."

      );

    }

  }



  function getInvoice(payment) {

    return invoices.find(

      (invoice) => invoice.id === getRelationId(payment.invoice)

    );

  }



  function getProjectName(payment) {

    const project = projects.find(

      (item) => item.id === getRelationId(payment.project)

    );



    return project?.project_name || "—";

  }



  function getClientName(payment) {

    const client = clients.find(

      (item) => item.id === getRelationId(payment.client)

    );



    return client?.company_name || client?.client_name || "—";

  }



  const filteredPayments = payments.filter((payment) => {

    const invoice = getInvoice(payment);

    const keyword = search.toLowerCase();



    const matchesSearch = [

      invoice?.invoice_number,

      getProjectName(payment),

      getClientName(payment),

      payment.reference_number,

      payment.notes,

    ]

      .filter(Boolean)

      .some((value) => String(value).toLowerCase().includes(keyword));



    const matchesStatus =

      statusFilter === "all" || payment.status === statusFilter;



    return matchesSearch && matchesStatus;

  });



  const totalPaid = payments

    .filter((payment) => payment.status === "paid")

    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);



  const totalPending = payments

    .filter((payment) => payment.status === "pending")

    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);



  return (

    <div className="page-container">

      <div className="page-header">

        <div>

          <h1>Pembayaran</h1>

          <p>

            Catat DP, cicilan, dan pelunasan yang diterima dari klien.

          </p>

        </div>



        <button

          type="button"

          className="project-primary-button"

          onClick={openCreateForm}

        >

          + Tambah Pembayaran

        </button>

      </div>



      <div className="project-summary-grid">

        <div className="project-summary-card">

          <span>Total Transaksi</span>

          <strong>{payments.length}</strong>

        </div>



        <div className="project-summary-card">

          <span>Total Uang Diterima</span>

          <strong>{formatCurrency(totalPaid)}</strong>

        </div>



        <div className="project-summary-card">

          <span>Total Menunggu</span>

          <strong>{formatCurrency(totalPending)}</strong>

        </div>

      </div>



      {error && !showForm && (
        <div className="project-error" role="alert">
          {error}
        </div>
      )}

      {success && !showForm && (
        <div className="project-success" role="status">
          {success}
        </div>
      )}



      <div className="project-filters">

        <input

          className="client-search"

          type="search"

          placeholder="Cari invoice, proyek, klien, atau referensi..."

          value={search}

          onChange={(event) => setSearch(event.target.value)}

        />



        <select

          value={statusFilter}

          onChange={(event) => setStatusFilter(event.target.value)}

          aria-label="Filter status pembayaran"

        >

          <option value="all">Semua Status</option>

          {paymentStatuses.map((status) => (

            <option key={status.value} value={status.value}>

              {status.label}

            </option>

          ))}

        </select>



        <button type="button" onClick={loadData}>

          Muat Ulang

        </button>

      </div>



      <div className="project-table-container">

        <table className="project-table">

          <thead>

            <tr>

              <th>Tanggal</th>

              <th>Invoice</th>

              <th>Proyek</th>

              <th>Klien</th>

              <th>Jenis</th>

              <th>Metode</th>

              <th>Nominal</th>

              <th>Status</th>

              <th>Referensi</th>

              <th>Aksi</th>

            </tr>

          </thead>



          <tbody>

            {loading ? (

              <tr>

                <td colSpan={10}>Memuat data pembayaran...</td>

              </tr>

            ) : filteredPayments.length === 0 ? (

              <tr>

                <td colSpan={10}>Belum ada data pembayaran.</td>

              </tr>

            ) : (

              filteredPayments.map((payment) => {

                const invoice = getInvoice(payment);



                return (

                  <tr key={payment.id}>

                    <td>{formatDate(payment.payment_date)}</td>

                    <td>{invoice?.invoice_number || "Belum terhubung"}</td>

                    <td>{getProjectName(payment)}</td>

                    <td>{getClientName(payment)}</td>

                    <td>

                      {paymentTypes.find(

                        (item) => item.value === payment.payment_type

                      )?.label || payment.payment_type}

                    </td>

                    <td>

                      {paymentMethods.find(

                        (item) => item.value === payment.payment_method

                      )?.label || payment.payment_method}

                    </td>

                    <td>{formatCurrency(payment.amount)}</td>

                    <td>

                      {paymentStatuses.find(

                        (item) => item.value === payment.status

                      )?.label || payment.status}

                    </td>

                    <td>{payment.reference_number || "—"}</td>

                    <td>

                      <div className="project-row-actions">

                        <button

                          type="button"

                          className="project-icon-button"

                          onClick={() => openEditForm(payment)}

                        >

                          Edit

                        </button>



                        <button

                          type="button"

                          className="project-icon-button project-delete-button"

                          onClick={() => handleDelete(payment)}

                        >

                          Hapus

                        </button>

                      </div>

                    </td>

                  </tr>

                );

              })

            )}

          </tbody>

        </table>

      </div>



      {showForm && (

        <div

          className="project-modal-overlay"

          onMouseDown={(event) => {

            if (event.target === event.currentTarget && !saving) {

              setShowForm(false);

            }

          }}

        >

          <section

            className="project-modal"

            role="dialog"

            aria-modal="true"

            aria-labelledby="payment-form-title"

          >

            <div className="project-modal-header">

              <h2 id="payment-form-title">

                {editingId ? "Edit Pembayaran" : "Tambah Pembayaran"}

              </h2>



              <button

                type="button"

                className="project-modal-close"

                onClick={() => setShowForm(false)}

                disabled={saving}

                aria-label="Tutup form"

              >

                ×

              </button>

            </div>



            {error && (

              <div className="project-error" role="alert">

                {error}

              </div>

            )}



            <form onSubmit={handleSubmit}>

              <div className="project-form-grid">

                <label className="project-field project-field-full">

                  Invoice yang Dibayar

                  <select

                    name="invoice"

                    value={form.invoice}

                    onChange={updateField}

                  >

                    <option value="">Pilih invoice (opsional)</option>

                    {invoices

                      .filter(

                        (invoice) =>

                          invoice.status !== "cancelled" ||

                          invoice.id === form.invoice

                      )

                      .map((invoice) => (

                        <option key={invoice.id} value={invoice.id}>

                          {invoice.invoice_number} —{" "}

                          {formatCurrency(invoice.amount)}

                        </option>

                      ))}

                  </select>

                  <small>

                    Pilih invoice agar DP dan pelunasan otomatis dihitung

                    pada tagihan terkait.

                  </small>

                </label>



                <label className="project-field">

                  Proyek

                  <select

                    name="project"

                    value={form.project}

                    onChange={updateField}

                  >

                    <option value="">Pilih proyek (opsional)</option>

                    {projects.map((project) => (

                      <option key={project.id} value={project.id}>

                        {project.project_code} — {project.project_name}

                      </option>

                    ))}

                  </select>

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

                  Tanggal Pembayaran

                  <input

                    type="date"

                    name="payment_date"

                    value={form.payment_date}

                    onChange={updateField}

                  />

                </label>



                <label className="project-field">

                  Nominal Pembayaran (Rp)

                  <input

                    type="number"

                    name="amount"

                    min="1"

                    step="1"

                    value={form.amount}

                    onChange={updateField}

                    required

                  />

                </label>



                <label className="project-field">

                  Jenis Pembayaran

                  <select

                    name="payment_type"

                    value={form.payment_type}

                    onChange={updateField}

                    required

                  >

                    {paymentTypes.map((item) => (

                      <option key={item.value} value={item.value}>

                        {item.label}

                      </option>

                    ))}

                  </select>

                </label>



                <label className="project-field">

                  Metode Pembayaran

                  <select

                    name="payment_method"

                    value={form.payment_method}

                    onChange={updateField}

                    required

                  >

                    {paymentMethods.map((item) => (

                      <option key={item.value} value={item.value}>

                        {item.label}

                      </option>

                    ))}

                  </select>

                </label>



                <label className="project-field">

                  Status Transaksi

                  <select

                    name="status"

                    value={form.status}

                    onChange={updateField}

                    required

                  >

                    {paymentStatuses.map((item) => (

                      <option key={item.value} value={item.value}>

                        {item.label}

                      </option>

                    ))}

                  </select>

                </label>



                <label className="project-field">

                  Nomor Referensi

                  <input

                    type="text"

                    name="reference_number"

                    value={form.reference_number}

                    onChange={updateField}

                    maxLength={255}

                    placeholder="Nomor transfer atau bukti"

                  />

                </label>



                <label className="project-field project-field-full">

                  Catatan

                  <textarea

                    name="notes"

                    value={form.notes}

                    onChange={updateField}

                    rows={3}

                    maxLength={5000}

                  />

                </label>

              </div>



              <div className="project-form-actions">

                <button

                  type="button"

                  onClick={() => setShowForm(false)}

                  disabled={saving}

                >

                  Batal

                </button>



                <button

                  type="submit"

                  className="project-primary-button"

                  disabled={saving}

                >

                  {saving ? "Menyimpan..." : "Simpan Pembayaran"}

                </button>

              </div>

            </form>

          </section>

        </div>

      )}

    </div>

  );

}
