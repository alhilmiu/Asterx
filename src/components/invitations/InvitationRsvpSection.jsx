import { useState } from "react";
import { Send, CheckCircle2, MessageSquare, Users, AlertCircle } from "lucide-react";

export default function InvitationRsvpSection({
  invitationId,
  rsvpEnabled = true,
  initialGuestName = "",
  rsvps = [],
  onRsvpSubmit,
  themeClass = "theme-minimal",
}) {
  const [guestName, setGuestName] = useState(initialGuestName || "");
  const [attendance, setAttendance] = useState("attending");
  const [guestCount, setGuestCount] = useState(1);
  const [wishesMessage, setWishesMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!guestName.trim()) {
      setSubmitError("Nama tamu wajib diisi.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      if (onRsvpSubmit) {
        await onRsvpSubmit({
          invitation: invitationId,
          guest_name: guestName.trim(),
          attendance,
          guest_count: Number(guestCount) || 1,
          wishes_message: wishesMessage.trim(),
          is_visible: true,
        });
      }
      setSubmitSuccess(true);
      setWishesMessage("");
    } catch (err) {
      console.error("Gagal mengirim RSVP:", err);
      setSubmitError(err?.message || "Gagal mengirim konfirmasi kehadiran. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={`invitation-rsvp-container ${themeClass}`}>
      <div className="invitation-section-header">
        <span className="invitation-section-eyebrow">RESERVASI & DOA RESTU</span>
        <h2 className="invitation-section-title">Konfirmasi Kehadiran</h2>
        <p className="invitation-section-desc">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.
        </p>
      </div>

      {!rsvpEnabled ? (
        <div className="rsvp-closed-alert">
          <AlertCircle size={24} />
          <p>Konfirmasi kehadiran untuk acara ini telah ditutup oleh pihak penyelenggara.</p>
        </div>
      ) : submitSuccess ? (
        <div className="rsvp-success-card">
          <CheckCircle2 size={44} className="success-icon" />
          <h3>Terima Kasih Banyak!</h3>
          <p>Konfirmasi kehadiran dan doa restu Anda telah berhasil kami simpan.</p>
          <button
            type="button"
            className="rsvp-submit-another-btn"
            onClick={() => setSubmitSuccess(false)}
          >
            Kirim Ucapan Lain
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rsvp-form-card">
          {submitError && (
            <div className="rsvp-error-banner">
              <AlertCircle size={18} />
              <span>{submitError}</span>
            </div>
          )}

          <div className="rsvp-field-group">
            <label htmlFor="rsvp-guest-name">Nama Tamu / Undangan *</label>
            <input
              id="rsvp-guest-name"
              type="text"
              required
              placeholder="Contoh: Bpk. Muhammad Hilmi"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="rsvp-field-group">
            <label>Konfirmasi Kehadiran *</label>
            <div className="rsvp-attendance-options">
              <label className={`attendance-chip ${attendance === "attending" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="attendance"
                  value="attending"
                  checked={attendance === "attending"}
                  onChange={() => setAttendance("attending")}
                />
                <span>Ya, Saya Hadir</span>
              </label>

              <label className={`attendance-chip ${attendance === "not_attending" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="attendance"
                  value="not_attending"
                  checked={attendance === "not_attending"}
                  onChange={() => setAttendance("not_attending")}
                />
                <span>Maaf, Belum Bisa Hadir</span>
              </label>

              <label className={`attendance-chip ${attendance === "tentative" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="attendance"
                  value="tentative"
                  checked={attendance === "tentative"}
                  onChange={() => setAttendance("tentative")}
                />
                <span>Masih Ragu</span>
              </label>
            </div>
          </div>

          {attendance === "attending" && (
            <div className="rsvp-field-group">
              <label htmlFor="rsvp-guest-count">
                <Users size={16} /> Jumlah Orang yang Hadir
              </label>
              <select
                id="rsvp-guest-count"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
              >
                <option value={1}>1 Orang</option>
                <option value={2}>2 Orang</option>
                <option value={3}>3 Orang</option>
                <option value={4}>4 Orang</option>
                <option value={5}>5 Orang</option>
              </select>
            </div>
          )}

          <div className="rsvp-field-group">
            <label htmlFor="rsvp-wishes">
              <MessageSquare size={16} /> Doa Restu & Ucapan Selamat
            </label>
            <textarea
              id="rsvp-wishes"
              rows={3}
              placeholder="Tuliskan ucapan selamat atau doa terbaik Anda untuk kedua mempelai..."
              value={wishesMessage}
              onChange={(e) => setWishesMessage(e.target.value)}
              maxLength={1000}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rsvp-submit-btn"
          >
            {submitting ? (
              <span>Mengirimkan...</span>
            ) : (
              <>
                <Send size={18} />
                <span>Kirim Konfirmasi & Doa Restu</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Daftar Ucapan Tamu */}
      <div className="rsvp-wishes-list-section">
        <h3 className="wishes-list-title">
          <MessageSquare size={20} />
          <span>Doa Restu dari Tamu ({rsvps.length})</span>
        </h3>

        {rsvps.length === 0 ? (
          <p className="no-wishes-text">Belum ada ucapan doa. Jadilah yang pertama memberikan doa restu!</p>
        ) : (
          <div className="wishes-scroll-box">
            {rsvps.map((item) => {
              const initial = (item.guest_name || "?").charAt(0).toUpperCase();
              const dateText = item.created ? new Date(item.created).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
              }) : "";

              return (
                <div key={item.id || Math.random()} className="wishes-card">
                  <div className="wishes-card-header">
                    <div className="wishes-avatar">{initial}</div>
                    <div className="wishes-author-meta">
                      <strong>{item.guest_name}</strong>
                      <div className="wishes-status-tag">
                        {item.attendance === "attending" && <span className="status-badge-green">Hadir ({item.guest_count || 1} orang)</span>}
                        {item.attendance === "not_attending" && <span className="status-badge-gray">Tidak Hadir</span>}
                        {item.attendance === "tentative" && <span className="status-badge-orange">Masih Ragu</span>}
                        <small className="wishes-time">{dateText}</small>
                      </div>
                    </div>
                  </div>
                  {item.wishes_message && (
                    <p className="wishes-card-message">{item.wishes_message}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
