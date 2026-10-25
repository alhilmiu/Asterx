import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Copy,
  Check,
  Gift,
  Share2,
  Sparkles
} from "lucide-react";
import InvitationCountdown from "./InvitationCountdown";
import InvitationRsvpSection from "./InvitationRsvpSection";

function InstagramIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export default function RusticFloralTemplate({
  invitation,
  guestName = "",
  rsvps = [],
  onRsvpSubmit,
}) {
  const [copiedBank, setCopiedBank] = useState("");
  const [shareNotice, setShareNotice] = useState(false);

  const content = invitation.content_data || {};
  const groom = content.groom || {};
  const bride = content.bride || {};
  const events = content.events || [];
  const digitalEnvelope = content.digital_envelope || [];
  const loveStory = content.love_story || [];

  function copyToClipboard(text, id) {
    navigator.clipboard.writeText(text);
    setCopiedBank(id);
    setTimeout(() => setCopiedBank(""), 2500);
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: invitation.title,
        text: `Undangan Pernikahan ${groom.nickname || "Pria"} & ${bride.nickname || "Wanita"}`,
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setShareNotice(true);
      setTimeout(() => setShareNotice(false), 2500);
    }
  }

  function createCalendarUrl(event) {
    if (!event.date) return "#";
    const startDate = (event.date || "").replace(/-/g, "");
    const startHour = (event.time_start || "09:00").replace(":", "") + "00";
    const endHour = (event.time_end || "12:00").replace(":", "") + "00";
    const text = encodeURIComponent(`${event.name || "Acara"} - ${invitation.title}`);
    const details = encodeURIComponent(`Lokasi: ${event.location_name || ""}, ${event.location_address || ""}`);
    const location = encodeURIComponent(`${event.location_name || ""}, ${event.location_address || ""}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startDate}T${startHour}/${startDate}T${endHour}&details=${details}&location=${location}`;
  }

  return (
    <div className="template-root template-rustic-floral">
      {/* Botanical Header / Hero */}
      <section className="rf-hero-section">
        <div className="rf-botanical-wreath">
          <Sparkles className="rf-sparkle-top" size={24} />
          <span className="rf-eyebrow">WALIMATUL 'URS</span>
          <h1 className="rf-couple-title">
            <span>{groom.nickname || "Romeo"}</span>
            <span className="rf-amp">&</span>
            <span>{bride.nickname || "Juliet"}</span>
          </h1>
          <p className="rf-event-date-display">
            {invitation.event_date ? new Date(invitation.event_date).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric"
            }) : "Tanggal Acara"}
          </p>

          {guestName && (
            <div className="rf-guest-card">
              <span className="rf-guest-label">Kepada Yth:</span>
              <strong className="rf-guest-name">{guestName}</strong>
            </div>
          )}

          <div className="rf-countdown-container">
            <InvitationCountdown targetDate={invitation.event_date} theme="rustic" />
          </div>
        </div>
      </section>

      {/* Quote Section */}
      {content.quote && (
        <section className="rf-quote-section">
          <div className="rf-container">
            <div className="rf-quote-card">
              <span className="rf-leaf-ornament">🌿</span>
              <blockquote className="rf-quote-text">“{content.quote}”</blockquote>
              {content.quote_source && (
                <cite className="rf-quote-source">{content.quote_source}</cite>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Couple Profiles */}
      <section className="rf-couple-section">
        <div className="rf-container">
          <div className="rf-section-header">
            <span className="rf-badge-pill">Mempelai Bahagia</span>
            <h2 className="rf-section-title">Kedua Mempelai</h2>
            <p className="rf-section-subtitle">
              Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan kami:
            </p>
          </div>

          <div className="rf-couple-grid">
            {/* Groom */}
            <div className="rf-profile-card">
              <div className="rf-photo-frame">
                {groom.photo_url ? (
                  <img src={groom.photo_url} alt={groom.name} className="rf-profile-photo" />
                ) : (
                  <div className="rf-photo-placeholder">
                    <span>{(groom.nickname || "P").charAt(0)}</span>
                  </div>
                )}
              </div>
              <h3 className="rf-profile-name">{groom.name || "Nama Mempelai Pria"}</h3>
              {groom.parents && <p className="rf-profile-parents">{groom.parents}</p>}
              {groom.instagram && (
                <a
                  href={`https://instagram.com/${groom.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rf-instagram-link"
                >
                  <InstagramIcon size={16} />
                  <span>@{groom.instagram.replace("@", "")}</span>
                </a>
              )}
            </div>

            <div className="rf-center-heart">
              <span className="rf-center-line"></span>
              <span className="rf-heart-badge">♥</span>
              <span className="rf-center-line"></span>
            </div>

            {/* Bride */}
            <div className="rf-profile-card">
              <div className="rf-photo-frame">
                {bride.photo_url ? (
                  <img src={bride.photo_url} alt={bride.name} className="rf-profile-photo" />
                ) : (
                  <div className="rf-photo-placeholder">
                    <span>{(bride.nickname || "W").charAt(0)}</span>
                  </div>
                )}
              </div>
              <h3 className="rf-profile-name">{bride.name || "Nama Mempelai Wanita"}</h3>
              {bride.parents && <p className="rf-profile-parents">{bride.parents}</p>}
              {bride.instagram && (
                <a
                  href={`https://instagram.com/${bride.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rf-instagram-link"
                >
                  <InstagramIcon size={16} />
                  <span>@{bride.instagram.replace("@", "")}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Agenda Acara */}
      {events.length > 0 && (
        <section className="rf-events-section">
          <div className="rf-container">
            <div className="rf-section-header">
              <span className="rf-badge-pill">Informasi Acara</span>
              <h2 className="rf-section-title">Waktu & Tempat</h2>
            </div>

            <div className="rf-events-grid">
              {events.map((evt, idx) => (
                <div key={idx} className="rf-event-card">
                  <span className="rf-event-ribbon">{evt.name || `Acara ${idx + 1}`}</span>
                  <div className="rf-event-details">
                    <div className="rf-detail-row">
                      <Calendar size={18} />
                      <span>
                        {evt.date ? new Date(evt.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        }) : "Tanggal belum ditentukan"}
                      </span>
                    </div>
                    <div className="rf-detail-row">
                      <Clock size={18} />
                      <span>{evt.time_start || "08:00"} - {evt.time_end || "Selesai"} {evt.timezone || "WIB"}</span>
                    </div>
                    <div className="rf-detail-row">
                      <MapPin size={18} />
                      <div>
                        <strong>{evt.location_name || "Nama Lokasi"}</strong>
                        {evt.location_address && <p>{evt.location_address}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="rf-card-buttons">
                    <a
                      href={createCalendarUrl(evt)}
                      target="_blank"
                      rel="noreferrer"
                      className="rf-btn-calendar"
                    >
                      <Calendar size={15} />
                      <span>Simpan Tanggal</span>
                    </a>
                    {evt.maps_url && (
                      <a
                        href={evt.maps_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rf-btn-maps"
                      >
                        <MapPin size={15} />
                        <span>Petunjuk Arah</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {content.maps_embed_url && (
              <div className="rf-maps-wrapper">
                <iframe
                  title="Peta Acara"
                  src={content.maps_embed_url}
                  width="100%"
                  height="340"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Love Story */}
      {loveStory.length > 0 && (
        <section className="rf-story-section">
          <div className="rf-container">
            <div className="rf-section-header">
              <span className="rf-badge-pill">Kisah Cinta</span>
              <h2 className="rf-section-title">Bagaimana Kami Memulai</h2>
            </div>

            <div className="rf-story-timeline">
              {loveStory.map((item, idx) => (
                <div key={idx} className="rf-story-card">
                  <div className="rf-story-badge">{item.year || "•"}</div>
                  <h4>{item.title}</h4>
                  <p>{item.story}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Amplop Digital */}
      {(digitalEnvelope.length > 0 || content.gift_address) && (
        <section className="rf-gifts-section">
          <div className="rf-container">
            <div className="rf-section-header">
              <span className="rf-badge-pill">Tanda Kasih</span>
              <h2 className="rf-section-title">Kado Pernikahan</h2>
              <p className="rf-section-subtitle">
                Kehadiran dan doa restu Anda adalah kado paling berharga. Namun apabila berkenan mengirimkan kado, silakan gunakan informasi berikut:
              </p>
            </div>

            <div className="rf-banks-grid">
              {digitalEnvelope.map((bank, idx) => {
                const isCopied = copiedBank === String(idx);
                return (
                  <div key={idx} className="rf-bank-card">
                    <span className="rf-bank-title">{bank.bank || "BANK"}</span>
                    <strong className="rf-account-num">{bank.account_number || "—"}</strong>
                    <span className="rf-account-name">a.n. {bank.account_holder || "—"}</span>
                    {bank.account_number && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(bank.account_number, String(idx))}
                        className={`rf-copy-btn ${isCopied ? "copied" : ""}`}
                      >
                        {isCopied ? (
                          <>
                            <Check size={15} />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={15} />
                            <span>Salin No. Rekening</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {content.gift_address && (
              <div className="rf-address-card">
                <Gift size={24} className="rf-gift-icon" />
                <div>
                  <h4>Kirim Kado ke Alamat</h4>
                  <p>{content.gift_address}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* RSVP Section */}
      <div className="rf-container">
        <InvitationRsvpSection
          invitationId={invitation.id}
          rsvpEnabled={invitation.rsvp_enabled}
          initialGuestName={guestName}
          rsvps={rsvps}
          onRsvpSubmit={onRsvpSubmit}
          themeClass="theme-rustic"
        />
      </div>

      {/* Footer */}
      <footer className="rf-footer">
        <div className="rf-container">
          <p className="rf-closing-text">
            Terima kasih atas segala doa restu dan kebaikan yang telah Anda berikan kepada kami berdua.
          </p>
          <h3 className="rf-closing-names">
            {groom.nickname || "Romeo"} & {bride.nickname || "Juliet"}
          </h3>

          <div className="rf-share-box">
            <button type="button" onClick={handleShare} className="rf-share-button">
              <Share2 size={16} />
              <span>{shareNotice ? "Tautan Berhasil Disalin!" : "Bagikan Undangan Ini"}</span>
            </button>
          </div>

          <small className="rf-copyright">Crafted with care by TriMi Digital Studio</small>
        </div>
      </footer>
    </div>
  );
}
