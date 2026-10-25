
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Plus, RefreshCw, Pencil, Trash2, X } from "lucide-react";
import { pb } from "../lib/pocketbase";

const initialForm = {
  customer_name: "",
  customer_phone: "",
  event_date: "",
  start_time: "",
  end_time: "",
  event_type: "",
  location: "",
  package_name: "",
  status: "inquiry",
  notes: "",
};

const statusLabels = {
  inquiry: "Inquiry",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function dateForInput(value) {
  return value ? value.slice(0, 10) : "";
}

export default function CalendarPage() {
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const user = pb.authStore.record;
  const canEdit = ["owner", "manager"].includes(user?.role);
  const isOwner = user?.role === "owner";

  

    const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
        const result = await pb.collection("bookings").getList(1, 500, {
        sort: "event_date,start_time",
        requestKey: null,
        });

        setBookings(result.items);
    } catch (err) {
        console.error("Gagal memuat booking:", err);

        if (err?.isAbort) {
        return;
        }

        setError(
        err?.message ||
            "Booking gagal dimuat. Periksa koneksi PocketBase dan API Rules."
        );
    } finally {
        setLoading(false);
    }
    }, []);



  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesDate =
        !filterDate || dateForInput(booking.event_date) === filterDate;
      const matchesStatus =
        filterStatus === "all" || booking.status === filterStatus;

      return matchesDate && matchesStatus;
    });
  }, [bookings, filterDate, filterStatus]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function startCreate() {
    setForm(initialForm);
    setEditingId(null);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function startEdit(booking) {
    setForm({
      customer_name: booking.customer_name || "",
      customer_phone: booking.customer_phone || "",
      event_date: dateForInput(booking.event_date),
      start_time: booking.start_time || "",
      end_time: booking.end_time || "",
      event_type: booking.event_type || "",
      location: booking.location || "",
      package_name: booking.package_name || "",
      status: booking.status || "inquiry",
      notes: booking.notes || "",
    });
    setEditingId(booking.id);
    setError("");
    setMessage("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (
      form.start_time &&
      form.end_time &&
      form.end_time <= form.start_time
    ) {
      setError("Waktu selesai harus setelah waktu mulai.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        event_date: new Date(
          `${form.event_date}T00:00:00.000Z`
        ).toISOString(),
      };

      if (editingId) {
        await pb.collection("bookings").update(editingId, payload);
        setMessage("Booking berhasil diperbarui.");
      } else {
        await pb.collection("bookings").create(payload);
        setMessage("Booking berhasil disimpan.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(initialForm);
      await loadBookings();
    } catch (err) {
      console.error(err);
      const details = err?.data?.data;
      const fieldErrors = details
        ? Object.entries(details)
            .map(([field, issue]) => `${field}: ${issue.message}`)
            .join("; ")
        : "";

      setError(
        fieldErrors ||
          err?.message ||
          "Gagal menyimpan booking. Periksa API Rules dan field database."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(booking) {
    const approved = window.confirm(
      `Hapus booking ${booking.customer_name}? Tindakan ini tidak dapat dibatalkan.`
    );

    if (!approved) return;

    setError("");
    setMessage("");

    try {
      await pb.collection("bookings").delete(booking.id);
      setMessage("Booking berhasil dihapus.");
      await loadBookings();
    } catch (err) {
      console.error(err);
      setError(
        "Booking gagal dihapus. Pastikan akun Owner dan API Rules mengizinkan penghapusan."
      );
    }
  }

  return (
    <div className="page-heading">
      <div className="calendar-heading">
        <div>
          <span className="eyebrow">MAZIYAN MANAGEMENT</span>
          <h1>Kalender Booking</h1>
          <p className="muted">
            Kelola jadwal acara dan data booking pelanggan.
          </p>
        </div>

        <div className="calendar-actions">
          <button
            type="button"
            className="refresh-button"
            onClick={loadBookings}
            disabled={loading}
          >
            <RefreshCw size={16} /> Muat ulang
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={showForm ? closeForm : startCreate}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Tutup form" : "Tambah booking"}
          </button>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form className="booking-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit booking" : "Data booking baru"}</h2>

          <div className="form-grid">
            <label>
              Nama pelanggan *
              <input
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                required
                maxLength={150}
              />
            </label>

            <label>
              Nomor telepon *
              <input
                name="customer_phone"
                type="tel"
                value={form.customer_phone}
                onChange={handleChange}
                required
                maxLength={30}
              />
            </label>

            <label>
              Tanggal acara *
              <input
                name="event_date"
                type="date"
                value={form.event_date}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Jenis acara
              <input
                name="event_type"
                value={form.event_type}
                onChange={handleChange}
                placeholder="Pernikahan, wisuda, dll."
              />
            </label>

            <label>
              Waktu mulai
              <input
                name="start_time"
                type="time"
                value={form.start_time}
                onChange={handleChange}
              />
            </label>

            <label>
              Waktu selesai
              <input
                name="end_time"
                type="time"
                value={form.end_time}
                onChange={handleChange}
                min={form.start_time || undefined}
              />
            </label>

            <label>
              Lokasi acara
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
              />
            </label>

            <label>
              Paket makeup
              <input
                name="package_name"
                value={form.package_name}
                onChange={handleChange}
              />
            </label>

            <label>
              Status booking
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-full">
              Catatan
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
              />
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="refresh-button"
              onClick={closeForm}
              disabled={saving}
            >
              Batal
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Menyimpan..."
                : editingId
                  ? "Simpan perubahan"
                  : "Simpan booking"}
            </button>
          </div>
        </form>
      )}

      <div className="booking-filters">
        <label>
          Filter tanggal
          <input
            type="date"
            value={filterDate}
            onChange={(event) => setFilterDate(event.target.value)}
          />
        </label>

        <label>
          Filter status
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
          >
            <option value="all">Semua status</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="refresh-button"
          onClick={() => {
            setFilterDate("");
            setFilterStatus("all");
          }}
        >
          Reset filter
        </button>
      </div>

      <div className="booking-summary">
        <span>Booking ditampilkan</span>
        <strong>{filteredBookings.length}</strong>
      </div>

      {loading ? (
        <p>Memuat data booking...</p>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state">
          <CalendarDays size={36} />
          <h2>Tidak ada booking</h2>
          <p>Coba ubah filter atau tambahkan booking baru.</p>
        </div>
      ) : (
        <div className="booking-list">
          {filteredBookings.map((booking) => (
            <article className="booking-card" key={booking.id}>
              <div className="booking-date">
                <CalendarDays size={20} />
                <span>{formatDate(booking.event_date)}</span>
                <span className="booking-status">
                  {statusLabels[booking.status] || booking.status}
                </span>
              </div>

              <h2>{booking.customer_name}</h2>
              <p>{booking.event_type || "Jenis acara belum diisi"}</p>
              <p>Telepon: {booking.customer_phone || "-"}</p>
              <p>
                Waktu: {booking.start_time || "--:--"} –{" "}
                {booking.end_time || "--:--"}
              </p>
              <p>Lokasi: {booking.location || "-"}</p>
              <p>Paket: {booking.package_name || "-"}</p>
              {booking.notes && <p>Catatan: {booking.notes}</p>}

              <div className="booking-card-actions">
                {canEdit && (
                  <button
                    type="button"
                    className="refresh-button"
                    onClick={() => startEdit(booking)}
                  >
                    <Pencil size={15} /> Edit
                  </button>
                )}

                {isOwner && (
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDelete(booking)}
                  >
                    <Trash2 size={15} /> Hapus
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
