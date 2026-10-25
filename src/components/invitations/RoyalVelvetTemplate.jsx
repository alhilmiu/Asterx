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
  Crown
} from "lucide-react";
import InvitationCountdown from "./InvitationCountdown";
import InvitationRsvpSection from "./InvitationRsvpSection";

function InstagramIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export default function RoyalVelvetTemplate({
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
        text: `The Royal Wedding of ${groom.nickname || "Pria"} & ${bride.nickname || "Wanita"}`,
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
    <div className="template-root template-royal-velvet">
      {/* Royal Crown Hero */}
      <section className="rv-hero-section">
        <div className="rv-gold-frame">
          <Crown className="rv-crown-icon" size={36} />
          <span className="rv-eyebrow">THE ROYAL CELEBRATION</span>
          <h1 className="rv-couple-title">
            <span className="rv-name">{groom.nickname || "Pangeran"}</span>
            <span className="rv-gold-amp">&</span>
            <span className="rv-name">{bride.nickname || "Putri"}</span>
          </h1>
          <div className="rv-ornament-divider">
            <span>❖</span>
          </div>
          <p className="rv-date-text">
            {invitation.event_date ? new Date(invitation.event_date).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric"
            }) : "Tanggal Acara"}
          </p>

          {guestName && (
            <div className="rv-guest-badge">
              <span className="rv-guest-label">SPECIAL INVITATION FOR:</span>
              <strong className="rv-guest-name">{guestName}</strong>
            </div>
          )}

          <div className="rv-countdown-wrapper">
            <InvitationCountdown targetDate={invitation.event_date} theme="royal" />
          </div>
        </div>
      </section>

      {/* Quote */}
      {content.quote && (
        <section className="rv-quote-section">
          <div className="rv-container">
            <div className="rv-quote-box">
              <span className="rv-quote-ornament">❝</span>
              <blockquote className="rv-quote-text">{content.quote}</blockquote>
              {content.quote_source && (
                <cite className="rv-quote-source">{content.quote_source}</cite>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Couple Profiles */}
      <section className="rv-couple-section">
        <div className="rv-container">
          <div className="rv-section-header">
            <span className="rv-section-badge">MEMPELAI</span>
            <h2 className="rv-section-title">Kedua Mempelai</h2>
            <div className="rv-gold-line"></div>
          </div>

          <div className="rv-couple-grid">
            {/* Groom */}
            <div className="rv-profile-card">
              <div className="rv-photo-border">
                {groom.photo_url ? (
                  <img src={groom.photo_url} alt={groom.name} className="rv-profile-photo" />
                ) : (
                  <div className="rv-photo-avatar">
                    <span>{(groom.nickname || "P").charAt(0)}</span>
                  </div>
                )}
              </div>
              <h3 className="rv-profile-name">{groom.name || "Nama Mempelai Pria"}</h3>
              {groom.parents && <p className="rv-profile-parents">{groom.parents}</p>}
              {groom.instagram && (
                <a
                  href={`https://instagram.com/${groom.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rv-profile-ig"
                >
                  <InstagramIcon size={15} />
                  <span>@{groom.instagram.replace("@", "")}</span>
                </a>
              )}
            </div>

            <div className="rv-ring-divider">
              <div className="rv-ring-circle">❖</div>
            </div>

            {/* Bride */}
            <div className="rv-profile-card">
              <div className="rv-photo-border">
                {bride.photo_url ? (
                  <img src={bride.photo_url} alt={bride.name} className="rv-profile-photo" />
                ) : (
                  <div className="rv-photo-avatar">
                    <span>{(bride.nickname || "W").charAt(0)}</span>
                  </div>
                )}
              </div>
              <h3 className="rv-profile-name">{bride.name || "Nama Mempelai Wanita"}</h3>
              {bride.parents && <p className="rv-profile-parents">{bride.parents}</p>}
              {bride.instagram && (
                <a
                  href={`https://instagram.com/${bride.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rv-profile-ig"
                >
                  <InstagramIcon size={15} />
                  <span>@{bride.instagram.replace("@", "")}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Events */}
      {events.length > 0 && (
        <section className="rv-events-section">
          <div className="rv-container">
            <div className="rv-section-header">
              <span className="rv-section-badge">AGENDA</span>
              <h2 className="rv-section-title">Waktu & Tempat</h2>
              <div className="rv-gold-line"></div>
            </div>

            <div className="rv-events-grid">
              {events.map((evt, idx) => (
                <div key={idx} className="rv-event-card">
                  <div className="rv-event-header">
                    <span className="rv-event-num">0{idx + 1}</span>
                    <h3 className="rv-event-title">{evt.name || `Agenda ${idx + 1}`}</h3>
                  </div>

                  <div className="rv-event-info-list">
                    <div className="rv-info-row">
                      <Calendar size={18} className="rv-gold-icon" />
                      <span>
                        {evt.date ? new Date(evt.date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        }) : "Tanggal belum ditentukan"}
                      </span>
                    </div>
                    <div className="rv-info-row">
                      <Clock size={18} className="rv-gold-icon" />
                      <span>{evt.time_start || "08:00"} - {evt.time_end || "Selesai"} {evt.timezone || "WIB"}</span>
                    </div>
                    <div className="rv-info-row">
                      <MapPin size={18} className="rv-gold-icon" />
                      <div>
                        <strong>{evt.location_name || "Nama Gedung"}</strong>
                        {evt.location_address && <p>{evt.location_address}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="rv-event-btns">
                    <a
                      href={createCalendarUrl(evt)}
                      target="_blank"
                      rel="noreferrer"
                      className="rv-btn-outline"
                    >
                      <Calendar size={15} />
                      <span>Google Calendar</span>
                    </a>
                    {evt.maps_url && (
                      <a
                        href={evt.maps_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rv-btn-gold"
                      >
                        <MapPin size={15} />
                        <span>Petunjuk Maps</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {content.maps_embed_url && (
              <div className="rv-maps-frame">
                <iframe
                  title="Peta Lokasi"
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

      {/* Story */}
      {loveStory.length > 0 && (
        <section className="rv-story-section">
          <div className="rv-container">
            <div className="rv-section-header">
              <span className="rv-section-badge">JOURNEY</span>
              <h2 className="rv-section-title">Kisah Cinta Kami</h2>
              <div className="rv-gold-line"></div>
            </div>

            <div className="rv-story-list">
              {loveStory.map((item, idx) => (
                <div key={idx} className="rv-story-card">
                  <div className="rv-story-point">❖</div>
                  <div className="rv-story-body">
                    <span className="rv-story-year">{item.year}</span>
                    <h4>{item.title}</h4>
                    <p>{item.story}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Amplop Digital */}
      {(digitalEnvelope.length > 0 || content.gift_address) && (
        <section className="rv-gift-section">
          <div className="rv-container">
            <div className="rv-section-header">
              <span className="rv-section-badge">HADIAH</span>
              <h2 className="rv-section-title">Tanda Kasih Digital</h2>
              <div className="rv-gold-line"></div>
              <p className="rv-section-subtitle">
                Ungkapan terima kasih kami atas kebaikan dan doa restu Anda:
              </p>
            </div>

            <div className="rv-bank-grid">
              {digitalEnvelope.map((bank, idx) => {
                const isCopied = copiedBank === String(idx);
                return (
                  <div key={idx} className="rv-bank-item">
                    <div className="rv-bank-top">
                      <span className="rv-bank-name">{bank.bank || "BANK"}</span>
                      <Crown size={18} className="rv-gold-icon" />
                    </div>
                    <div className="rv-bank-number">{bank.account_number || "—"}</div>
                    <div className="rv-bank-holder">a.n. {bank.account_holder || "—"}</div>
                    {bank.account_number && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(bank.account_number, String(idx))}
                        className={`rv-copy-btn ${isCopied ? "copied" : ""}`}
                      >
                        {isCopied ? (
                          <>
                            <Check size={15} />
                            <span>Nomor Tersalin!</span>
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
              <div className="rv-address-card">
                <Gift size={24} className="rv-gold-icon" />
                <div>
                  <h4>Kirim Kado Fisik</h4>
                  <p>{content.gift_address}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* RSVP */}
      <div className="rv-container">
        <InvitationRsvpSection
          invitationId={invitation.id}
          rsvpEnabled={invitation.rsvp_enabled}
          initialGuestName={guestName}
          rsvps={rsvps}
          onRsvpSubmit={onRsvpSubmit}
          themeClass="theme-royal"
        />
      </div>

      {/* Footer */}
      <footer className="rv-footer">
        <div className="rv-container">
          <Crown size={28} className="rv-crown-footer" />
          <p className="rv-footer-note">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
          </p>
          <h3 className="rv-footer-names">
            {groom.nickname || "Pria"} & {bride.nickname || "Wanita"}
          </h3>

          <div className="rv-share-section">
            <button type="button" onClick={handleShare} className="rv-gold-share-btn">
              <Share2 size={16} />
              <span>{shareNotice ? "Link Tersalin!" : "Bagikan Undangan"}</span>
            </button>
          </div>

          <small className="rv-brand-credit">TriMi Digital Studio • Exclusive Wedding Invitations</small>
        </div>
      </footer>
    </div>
  );
}
