import "./InvitationsCatalogPage.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Check, ArrowRight, Eye, ShieldCheck, Heart, Crown, Leaf } from "lucide-react";
import { pb } from "../lib/pocketbase";
import TemplateRenderer from "../components/invitations/TemplateRenderer";
import "../components/invitations/Invitations.css";

// Sample mock invitation for live template preview
const sampleInvitationData = {
  id: "preview-sample",
  title: "The Wedding of Gilang & Dinda",
  event_type: "wedding",
  event_date: "2026-11-20",
  rsvp_enabled: true,
  content_data: {
    quote: "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.",
    quote_source: "Q.S. Ar-Rum: 21",
    groom: {
      name: "Gilang Pratama, S.T.",
      nickname: "Gilang",
      parents: "Putra pertama dari Bpk. Bambang & Ibu Siti",
      instagram: "gilangpratama"
    },
    bride: {
      name: "Dinda Larasati, S.Ds.",
      nickname: "Dinda",
      parents: "Putri kedua dari Bpk. Hendro & Ibu Sri",
      instagram: "dindalarasati"
    },
    events: [
      {
        name: "Akad Nikah",
        date: "2026-11-20",
        time_start: "08:00",
        time_end: "10:00",
        timezone: "WIB",
        location_name: "Masjid Nasional Al-Akbar",
        location_address: "Jl. Masjid Al-Akbar No. 1, Surabaya"
      },
      {
        name: "Resepsi Pernikahan",
        date: "2026-11-20",
        time_start: "11:00",
        time_end: "14:00",
        timezone: "WIB",
        location_name: "Grand Ballroom Hotel Majapahit",
        location_address: "Jl. Tunjungan No. 65, Surabaya"
      }
    ],
    love_story: [
      { year: "2021", title: "Pertama Bertemu", story: "Bertemu di kampus dalam sebuah proyek desain bersama." },
      { year: "2024", title: "Lamaran", story: "Berkomitmen melangkah ke jenjang yang lebih serius bersama keluarga." }
    ],
    digital_envelope: [
      { bank: "BCA", account_number: "1234567890", account_holder: "Gilang Pratama" },
      { bank: "Bank Mandiri", account_number: "9876543210", account_holder: "Dinda Larasati" }
    ],
    gift_address: "Jl. Rungkut Asri Timur No. 18, Surabaya (Penerima: Gilang)"
  }
};

export default function InvitationsCatalogPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState(null);

  useEffect(() => {
    async function loadTemplates() {
      try {
        setLoading(true);
        const records = await pb.collection("invitation_templates").getFullList({
          filter: "is_active = true",
          sort: "sort_order,created",
          requestKey: null,
        });
        setTemplates(records);
      } catch (err) {
        console.error("Gagal memuat katalog template:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTemplates();
  }, []);

  const categories = [
    { id: "all", label: "Semua Template" },
    { id: "wedding", label: "Pernikahan" },
    { id: "birthday", label: "Ulang Tahun" },
    { id: "engagement", label: "Lamaran" },
  ];

  const filteredTemplates = templates.filter((t) => {
    if (selectedCategory === "all") return true;
    return t.category === selectedCategory;
  });

  function formatIDR(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }

  function getTemplateThemeIcon(slug) {
    if (slug?.includes("rustic")) return <Leaf size={20} className="text-amber-500" />;
    if (slug?.includes("royal")) return <Crown size={20} className="text-yellow-500" />;
    return <Sparkles size={20} className="text-indigo-400" />;
  }

  return (
    <div className="catalog-page-container">
      {/* Top Header */}
      <header className="catalog-header">
        <div className="catalog-nav-bar">
          <Link to="/" className="catalog-brand-link">
            <span className="brand-dot"></span>
            <strong>TriMi</strong>
            <small>DIGITAL INVITATIONS</small>
          </Link>
          <div className="catalog-nav-actions">
            <Link to="/invitations/editor" className="create-custom-btn">
              <span>Buat Undangan Sekarang</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="catalog-hero-text">
          <span className="catalog-badge">
            <Sparkles size={14} />
            KATALOG RESMI TRIMI
          </span>
          <h1>Rayakan Momen Spesial dengan Undangan Digital Eksklusif</h1>
          <p>
            Pilih template desain favorit Anda, isi detail acara dengan mudah, dan bagikan undangan digital interaktif kepada para tamu melalui domain resmi TriMi.
          </p>

          <div className="catalog-highlights">
            <div className="highlight-item">
              <Check size={18} />
              <span>RSVP & Buku Tamu Real-time</span>
            </div>
            <div className="highlight-item">
              <Check size={18} />
              <span>Amplop Digital & Lokasi Maps</span>
            </div>
            <div className="highlight-item">
              <Check size={18} />
              <span>Domain Resmi /i/:slug</span>
            </div>
            <div className="highlight-item">
              <Check size={18} />
              <span>Bayar Per Undangan</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Catalog Section */}
      <main className="catalog-main">
        {/* Category Filters */}
        <div className="catalog-filters">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-pill ${selectedCategory === cat.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="catalog-loading-box">
            <div className="loading-spinner"></div>
            <p>Memuat koleksi template pilihan...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="catalog-empty-box">
            <p>Belum ada template pada kategori ini.</p>
          </div>
        ) : (
          <div className="templates-cards-grid">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="template-card-box">
                <div className="template-card-visual">
                  <div className={`template-preview-mockup ${template.slug}`}>
                    <div className="mockup-header">
                      {getTemplateThemeIcon(template.slug)}
                      <span className="mockup-badge">{template.category}</span>
                    </div>
                    <div className="mockup-content">
                      <small>THE WEDDING OF</small>
                      <h3>Romeo & Juliet</h3>
                      <p>20 November 2026</p>
                    </div>
                    <div className="mockup-footer">
                      <span>RSVP Terbuka</span>
                      <span>•</span>
                      <span>Amplop Digital</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(template)}
                    className="card-quick-preview-btn"
                  >
                    <Eye size={16} />
                    <span>Lihat Contoh Lengkap</span>
                  </button>
                </div>

                <div className="template-card-info">
                  <div className="card-title-row">
                    <h3>{template.name}</h3>
                    <span className="card-price-tag">{formatIDR(template.base_price)}</span>
                  </div>
                  <p className="card-description">{template.description || "Template modern dengan responsivitas penuh."}</p>

                  <div className="card-actions-row">
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(template)}
                      className="btn-preview-modal"
                    >
                      <Eye size={16} />
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/invitations/editor?template=${template.id}`)}
                      className="btn-select-template"
                    >
                      <span>Pilih Template Ini</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Live Preview Modal */}
      {previewTemplate && (
        <div className="catalog-preview-modal-overlay">
          <div className="preview-modal-container">
            <div className="preview-modal-topbar">
              <div className="topbar-info">
                <strong>{previewTemplate.name}</strong>
                <span className="preview-badge">Live Interactive Preview</span>
              </div>
              <div className="topbar-actions">
                <button
                  type="button"
                  onClick={() => navigate(`/invitations/editor?template=${previewTemplate.id}`)}
                  className="preview-use-btn"
                >
                  <span>Gunakan Template Ini ({formatIDR(previewTemplate.base_price)})</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="preview-close-btn"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="preview-modal-body">
              <div className="preview-device-wrapper">
                <TemplateRenderer
                  templateKey={previewTemplate.slug}
                  invitation={sampleInvitationData}
                  guestName="Bapak / Ibu Tamu Terhormat"
                  rsvps={[
                    { id: "1", guest_name: "Hilmi", attendance: "attending", guest_count: 2, wishes_message: "Selamat ya Gilang & Dinda! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.", created: "2026-10-21T07:00:00Z" }
                  ]}
                  onRsvpSubmit={async () => {
                    alert("Ini adalah mode preview. Di undangan asli Anda, RSVP akan otomatis tersimpan ke sistem database TriMi.");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple Footer */}
      <footer className="catalog-footer">
        <p>© 2026 TriMi Digital Studio. Layanan Undangan Digital Terpercaya & Interaktif.</p>
      </footer>
    </div>
  );
}
