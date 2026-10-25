import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Heart,
  Copy,
  Check,
  ExternalLink,
  Gift,
  Share2
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

export default function ModernMinimalistTemplate({
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
    <div className="template-root template-modern-minimalist">
      {/* Hero Section */}
      <section className="mm-hero-section">
        <div className="mm-hero-backdrop"></div>
        <div className="mm-hero-content">
          <span className="mm-eyebrow">THE WEDDING OF</span>
          <h1 className="mm-couple-title">
            <span className="name-part">{groom.nickname || "Groom"}</span>
            <span className="name-amp">&</span>
            <span className="name-part">{bride.nickname || "Bride"}</span>
          </h1>
          <p className="mm-event-date-display">
            {invitation.event_date ? new Date(invitation.event_date).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric"
            }) : "Tanggal Acara"}
          </p>

          {guestName && (
            <div className="mm-guest-welcome-card">
              <span className="guest-badge-label">Kepada Yth. Bapak/Ibu/Saudara/i:</span>
              <strong className="guest-name-text">{guestName}</strong>
            </div>
          )}

          <div className="mm-countdown-container">
            <InvitationCountdown targetDate={invitation.event_date} theme="minimal" />
          </div>
        </div>
      </section>

      {/* Quote Section */}
      {content.quote && (
        <section className="mm-quote-section">
          <div className="mm-container">
            <div className="mm-quote-box">
              <Heart className="mm-quote-icon" size={24} />
              <blockquote className="mm-quote-text">“{content.quote}”</blockquote>
              {content.quote_source && (
                <cite className="mm-quote-source">{content.quote_source}</cite>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Couple Profiles */}
      <section className="mm-couple-section">
        <div className="mm-container">
          <div className="mm-section-header">
            <span className="mm-eyebrow">MEMPELAI</span>
            <h2 className="mm-section-title">Kedua Mempelai</h2>
            <p className="mm-section-subtitle">
              Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan.
            </p>
          </div>

          <div className="mm-couple-grid">
            {/* Groom */}
            <div className="mm-profile-card">
              {groom.photo_url ? (
                <img src={groom.photo_url} alt={groom.name} className="mm-profile-photo" />
              ) : (
                <div className="mm-profile-avatar-placeholder">
                  <span>{(groom.nickname || "G").charAt(0)}</span>
                </div>
              )}
              <h3 className="mm-profile-name">{groom.name || "Nama Lengkap Mempelai Pria"}</h3>
              {groom.parents && <p className="mm-profile-parents">{groom.parents}</p>}
              {groom.instagram && (
                <a
                  href={`https://instagram.com/${groom.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mm-profile-social"
                >
                  <InstagramIcon size={16} />
                  <span>@{groom.instagram.replace("@", "")}</span>
                </a>
              )}
            </div>

            <div className="mm-couple-separator">
              <span className="mm-sep-line"></span>
              <Heart size={28} className="mm-heart-icon" />
              <span className="mm-sep-line"></span>
            </div>

            {/* Bride */}
            <div className="mm-profile-card">
              {bride.photo_url ? (
                <img src={bride.photo_url} alt={bride.name} className="mm-profile-photo" />
              ) : (
                <div className="mm-profile-avatar-placeholder">
                  <span>{(bride.nickname || "B").charAt(0)}</span>
                </div>
              )}
              <h3 className="mm-profile-name">{bride.name || "Nama Lengkap Mempelai Wanita"}</h3>
              {bride.parents && <p className="mm-profile-parents">{bride.parents}</p>}
              {bride.instagram && (
                <a
                  href={`https://instagram.com/${bride.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mm-profile-social"
                >
                  <InstagramIcon size={16} />
                  <span>@{bride.instagram.replace("@", "")}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Events Agenda */}
      {events.length > 0 && (
        <section className="mm-events-section">
          <div className="mm-container">
            <div className="mm-section-header">
              <span className="mm-eyebrow">RANGKAIAN ACARA</span>
              <h2 className="mm-section-title">Waktu & Tempat</h2>
              <p className="mm-section-subtitle">
                Dengan penuh rasa syukur, kami mengundang Anda untuk hadir pada:
              </p>
            </div>

            <div className="mm-events-grid">
              {events.map((evt, idx) => (
                <div key={idx} className="mm-event-card">
                  <h3 className="mm-event-name">{evt.name || `Sesi Acara ${idx + 1}`}</h3>
                  <div className="mm-event-details">
                    <div className="mm-event-item">
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
                    <div className="mm-event-item">
                      <Clock size={18} />
                      <span>{evt.time_start || "08:00"} - {evt.time_end || "Selesai"} {evt.timezone || "WIB"}</span>
                    </div>
                    <div className="mm-event-item">
                      <MapPin size={18} />
                      <div>
                        <strong>{evt.location_name || "Nama Lokasi / Gedung"}</strong>
                        {evt.location_address && <p>{evt.location_address}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="mm-event-actions">
                    <a
                      href={createCalendarUrl(evt)}
                      target="_blank"
                      rel="noreferrer"
                      className="mm-btn-outline"
                    >
                      <Calendar size={16} />
                      <span>Tambah ke Kalender</span>
                    </a>
                    {evt.maps_url && (
                      <a
                        href={evt.maps_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mm-btn-primary"
                      >
                        <MapPin size={16} />
                        <span>Buka Google Maps</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {content.maps_embed_url && (
              <div className="mm-maps-embed-box">
                <iframe
                  title="Peta Lokasi Acara"
                  src={content.maps_embed_url}
                  width="100%"
                  height="360"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Love Story Section */}
      {loveStory.length > 0 && (
        <section className="mm-story-section">
          <div className="mm-container">
            <div className="mm-section-header">
              <span className="mm-eyebrow">KISAH KAMI</span>
              <h2 className="mm-section-title">Perjalanan Cinta</h2>
            </div>

            <div className="mm-story-timeline">
              {loveStory.map((story, i) => (
                <div key={i} className="mm-story-item">
                  <div className="mm-story-year">{story.year || "—"}</div>
                  <div className="mm-story-content">
                    <h4>{story.title || "Momen Berharga"}</h4>
                    <p>{story.story || ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Digital Envelope / Gifts */}
      {(digitalEnvelope.length > 0 || content.gift_address) && (
        <section className="mm-gift-section">
          <div className="mm-container">
            <div className="mm-section-header">
              <span className="mm-eyebrow">TANDA KASIH</span>
              <h2 className="mm-section-title">Amplop Digital</h2>
              <p className="mm-section-subtitle">
                Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda ingin memberikan tanda kasih secara digital, Anda dapat melalui rekening berikut:
              </p>
            </div>

            <div className="mm-bank-cards-grid">
              {digitalEnvelope.map((bank, idx) => {
                const isCopied = copiedBank === String(idx);
                return (
                  <div key={idx} className="mm-bank-card">
                    <div className="bank-card-chip"></div>
                    <div className="bank-name-badge">{bank.bank || "BANK"}</div>
                    <div className="bank-account-num">{bank.account_number || "—"}</div>
                    <div className="bank-account-holder">a.n. {bank.account_holder || "—"}</div>
                    {bank.account_number && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(bank.account_number, String(idx))}
                        className={`mm-copy-btn ${isCopied ? "copied" : ""}`}
                      >
                        {isCopied ? (
                          <>
                            <Check size={16} />
                            <span>Nomor Rekening Disalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            <span>Salin Nomor Rekening</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {content.gift_address && (
              <div className="mm-gift-address-box">
                <Gift size={24} className="gift-box-icon" />
                <div>
                  <h4>Kirim Kado Fisik</h4>
                  <p>{content.gift_address}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* RSVP Section */}
      <div className="mm-container">
        <InvitationRsvpSection
          invitationId={invitation.id}
          rsvpEnabled={invitation.rsvp_enabled}
          initialGuestName={guestName}
          rsvps={rsvps}
          onRsvpSubmit={onRsvpSubmit}
          themeClass="theme-minimal"
        />
      </div>

      {/* Share & Footer */}
      <footer className="mm-footer-section">
        <div className="mm-container">
          <p className="mm-thank-you">
            Merupakan suatu kehormatan & kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
          </p>
          <h3 className="mm-footer-couple">
            {groom.nickname || "Pria"} & {bride.nickname || "Wanita"}
          </h3>

          <div className="mm-share-wrapper">
            <button type="button" onClick={handleShare} className="mm-share-btn">
              <Share2 size={18} />
              <span>{shareNotice ? "Link Undangan Disalin!" : "Bagikan Undangan Ini"}</span>
            </button>
          </div>

          <div className="mm-powered-by">
            <small>Dibuat dengan ❤️ di TriMi Digital Studio</small>
          </div>
        </div>
      </footer>
    </div>
  );
}
