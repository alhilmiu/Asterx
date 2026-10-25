import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Mail, Heart, AlertTriangle, ShieldCheck, Sparkles, Volume2 } from "lucide-react";
import { pb } from "../lib/pocketbase";
import TemplateRenderer from "../components/invitations/TemplateRenderer";
import InvitationAudioPlayer from "../components/invitations/InvitationAudioPlayer";
import "../components/invitations/Invitations.css";
import "./PublicInvitationPage.css";

export default function PublicInvitationPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const guestName = searchParams.get("to") || searchParams.get("u") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invitationData, setInvitationData] = useState(null);
  const [templateData, setTemplateData] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [playAudio, setPlayAudio] = useState(false);
  const [isStaffPreview, setIsStaffPreview] = useState(false);

  useEffect(() => {
    async function fetchInvitation() {
      if (!slug) {
        setError("Slug undangan tidak ditemukan.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        // Panggil endpoint aman pb_hooks
        const res = await pb.send(
          `/api/trimi/invitations/public/${encodeURIComponent(slug)}`,
          {
            requestKey: null,
          }
        );
        if (res && res.success) {
          setInvitationData(res.invitation);
          setTemplateData(res.template);
          setRsvps(res.rsvps || []);
          setIsStaffPreview(Boolean(res.isStaffPreview));
        } else {
          setError("Undangan tidak ditemukan atau belum aktif.");
        }
      } catch (err) {
        console.error("Gagal memuat undangan:", err);
        setError(
          err?.response?.message ||
          "Undangan tidak ditemukan atau belum diterbitkan. Pastikan tautan sudah benar dan pembayaran telah diselesaikan."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchInvitation();
  }, [slug]);

  // Handler RSVP Submit publik
  async function handleRsvpSubmit(payload) {
    if (!invitationData) return;

    // Simpan ke koleksi PocketBase invitation_rsvps
    const record = await pb.collection("invitation_rsvps").create({
      invitation: invitationData.id,
      guest_name: payload.guest_name,
      attendance: payload.attendance,
      guest_count: Number(payload.guest_count) || 1,
      wishes_message: payload.wishes_message,
      is_visible: true,
    });

    // Update state RSVP secara optimistik
    setRsvps((prev) => [
      {
        id: record.id,
        guest_name: record.guest_name,
        attendance: record.attendance,
        guest_count: record.guest_count,
        wishes_message: record.wishes_message,
        created: record.created || new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  function handleOpenInvitation() {
    setIsOpen(true);
    setPlayAudio(true);
  }

  // Loading State
  if (loading) {
    return (
      <div className="public-inv-loading-screen">
        <div className="loading-heart-pulse">
          <Heart size={36} />
        </div>
        <h2>Mempersiapkan Undangan Spesial...</h2>
        <p>Mohon tunggu sebentar</p>
      </div>
    );
  }

  // Error / 404 State
  if (error || !invitationData) {
    return (
      <div className="public-inv-error-screen">
        <div className="error-card">
          <AlertTriangle size={48} className="error-icon" />
          <h1>Undangan Tidak Tersedia</h1>
          <p>{error || "Undangan dengan alamat ini tidak ditemukan atau belum memenuhi syarat publikasi."}</p>
          <div className="error-help-box">
            <small>
              Bagi pemilik undangan, pastikan pembayaran pesanan telah diverifikasi oleh tim TriMi agar tautan publik aktif.
            </small>
          </div>
          <a href="/" className="back-to-home-link">
            Kembali ke Beranda TriMi
          </a>
        </div>
      </div>
    );
  }

  const content = invitationData.content_data || {};
  const groom = content.groom || {};
  const bride = content.bride || {};
  const templateSlug = templateData?.slug || "modern-minimalist";

  // URL audio musik
  let audioUrl = invitationData.music_url || "";
  if (invitationData.music_file) {
    audioUrl = pb.files.getURL(invitationData, invitationData.music_file);
  }

  return (
    <div className="public-invitation-viewport">
      {/* Staff Preview Notice Banner */}
      {isStaffPreview && (
        <div className="staff-preview-banner">
          <ShieldCheck size={18} />
          <span>
            Mode Pratinjau Admin: Undangan ini belum berstatus Lunas (Paid) dan hanya dapat dilihat oleh tim internal TriMi.
          </span>
        </div>
      )}

      {/* Floating Audio Player */}
      {isOpen && audioUrl && (
        <InvitationAudioPlayer audioUrl={audioUrl} autoPlay={playAudio} />
      )}

      {/* Cover Modal / Buka Undangan Overlay */}
      {!isOpen && (
        <div className={`invitation-cover-overlay cover-${templateSlug}`}>
          <div className="cover-inner-card">
            <span className="cover-eyebrow">THE WEDDING OF</span>
            <h1 className="cover-couple-names">
              {groom.nickname || "Pria"} & {bride.nickname || "Wanita"}
            </h1>
            <p className="cover-date-text">
              {invitationData.event_date ? new Date(invitationData.event_date).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              }) : "Tanggal Acara"}
            </p>

            <div className="cover-guest-box">
              <span className="to-label">Kepada Yth. Bapak/Ibu/Saudara/i:</span>
              <strong className="guest-highlight">{guestName || "Tamu Terhormat"}</strong>
              <small className="apology-text">Mohon maaf apabila ada kesalahan penulisan nama/gelar</small>
            </div>

            <button
              type="button"
              onClick={handleOpenInvitation}
              className="open-invitation-btn"
            >
              <Mail size={18} />
              <span>Buka Undangan</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Rendered Template */}
      <TemplateRenderer
        templateKey={templateSlug}
        invitation={invitationData}
        guestName={guestName}
        rsvps={rsvps}
        onRsvpSubmit={handleRsvpSubmit}
      />
    </div>
  );
}
