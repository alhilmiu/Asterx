import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import {
  Save,
  ArrowRight,
  ArrowLeft,
  Eye,
  Check,
  AlertCircle,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Heart,
  CreditCard,
  Upload,
  Link as LinkIcon,
  ShieldCheck,
  Smartphone,
  Layers,
  Copy,
  Plus,
  Trash2,
  FileCheck
} from "lucide-react";
import { pb, getCurrentUser } from "../lib/pocketbase";
import TemplateRenderer from "../components/invitations/TemplateRenderer";
import "./InvitationEditorPage.css";

const defaultContent = {
  quote: "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
  quote_source: "Q.S. Ar-Rum: 21",
  groom: {
    name: "Gilang Pratama, S.T.",
    nickname: "Gilang",
    parents: "Putra pertama dari Bpk. Bambang & Ibu Siti",
    instagram: "gilangpratama",
    photo_url: "",
  },
  bride: {
    name: "Dinda Larasati, S.Ds.",
    nickname: "Dinda",
    parents: "Putri kedua dari Bpk. Hendro & Ibu Sri",
    instagram: "dindalarasati",
    photo_url: "",
  },
  events: [
    {
      name: "Akad Nikah",
      date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      time_start: "08:00",
      time_end: "10:00",
      timezone: "WIB",
      location_name: "Masjid Nasional Al-Akbar",
      location_address: "Jl. Masjid Al-Akbar Timur No. 1, Surabaya",
      maps_url: "https://maps.google.com",
    },
    {
      name: "Resepsi Pernikahan",
      date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      time_start: "11:00",
      time_end: "14:00",
      timezone: "WIB",
      location_name: "Grand Ballroom Hotel Majapahit",
      location_address: "Jl. Tunjungan No. 65, Surabaya",
      maps_url: "https://maps.google.com",
    },
  ],
  maps_embed_url: "",
  love_story: [
    { year: "2021", title: "Pertama Bertemu", story: "Berkenalan saat berkolaborasi dalam proyek digital kreatif." },
    { year: "2024", title: "Komitmen & Lamaran", story: "Memutuskan untuk melangkah bersama menuju ikatan suci pernikahan." },
  ],
  digital_envelope: [
    { bank: "BCA", account_number: "8290123456", account_holder: "Gilang Pratama" },
    { bank: "Bank Mandiri", account_number: "142001928374", account_holder: "Dinda Larasati" },
  ],
  gift_address: "Jl. Rungkut Asri Timur No. 18, Rungkut, Surabaya (Penerima: Gilang - 08123456789)",
};

export default function InvitationEditorPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isStaff = currentUser && ["owner", "manager", "admin"].includes(currentUser.role);

  // States
  const [templates, setTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState("template"); // template, couple, events, story, gifts, settings, payment
  const [previewDevice, setPreviewDevice] = useState("mobile"); // mobile, desktop
  const [showLivePreview, setShowLivePreview] = useState(false);

  const [invitationId, setInvitationId] = useState(id || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState(searchParams.get("template") || "");
  const [title, setTitle] = useState("The Wedding of Gilang & Dinda");
  const [slug, setSlug] = useState("");
  const [eventType, setEventType] = useState("wedding");
  const [eventDate, setEventDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );
  const [rsvpEnabled, setRsvpEnabled] = useState(true);
  const [content, setContent] = useState(defaultContent);
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [isActive, setIsActive] = useState(false);

  // File Upload states
  const [coverFile, setCoverFile] = useState(null);
  const [musicFile, setMusicFile] = useState(null);
  const [musicUrl, setMusicUrl] = useState("");

  // Order & Payment Checkout states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Status indicators
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [slugAvailable, setSlugAvailable] = useState(null);

  // Load available templates & existing draft if ID is provided
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const templateList = await pb.collection("invitation_templates").getFullList({
          sort: "sort_order,created",
          requestKey: null,
        });
        setTemplates(templateList);

        // Auto select template from query params or first template
        const paramTpl = searchParams.get("template");
        if (paramTpl) {
          const match = templateList.find((t) => t.id === paramTpl || t.slug === paramTpl);
          if (match) setSelectedTemplateId(match.id);
        } else if (templateList.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(templateList[0].id);
        }

        // If editing existing invitation
        if (id) {
          const record = await pb.collection("invitations").getOne(id, { requestKey: null });
          setInvitationId(record.id);
          setTitle(record.title || "");
          setSlug(record.slug || "");
          setSelectedTemplateId(record.template || "");
          setEventType(record.event_type || "wedding");
          setEventDate(record.event_date ? record.event_date.slice(0, 10) : "");
          setRsvpEnabled(Boolean(record.rsvp_enabled));
          setPaymentStatus(record.payment_status || "unpaid");
          setIsActive(Boolean(record.is_active));
          setMusicUrl(record.music_url || "");
          if (record.content_data && Object.keys(record.content_data).length > 0) {
            setContent({ ...defaultContent, ...record.content_data });
          }

          // Check if there is an existing order
          try {
            const orderRecord = await pb.collection("invitation_orders").getFirstListItem(`invitation = "${record.id}"`);
            setCurrentOrder(orderRecord);
          } catch (_) {}
        } else {
          // Check local storage draft if available
          const localDraft = localStorage.getItem("trimi_invitation_draft");
          if (localDraft) {
            try {
              const parsed = JSON.parse(localDraft);
              setTitle(parsed.title || title);
              setSlug(parsed.slug || "");
              setContent({ ...defaultContent, ...parsed.content });
            } catch (_) {}
          }
        }
      } catch (err) {
        console.error("Gagal inisialisasi editor:", err);
        setError("Gagal memuat data editor. Periksa koneksi PocketBase.");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [id, searchParams]);

  // Auto-generate slug when couple names change if slug is empty
  useEffect(() => {
    if (!slug && content.groom?.nickname && content.bride?.nickname) {
      const generated = `${content.groom.nickname}-${content.bride.nickname}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generated);
    }
  }, [content.groom?.nickname, content.bride?.nickname, slug]);

  // Check slug uniqueness
  async function checkSlug(slugToCheck) {
    const clean = (slugToCheck || "").trim().toLowerCase();
    if (!clean || clean.length < 3) {
      setSlugAvailable(null);
      return;
    }

    try {
      const existing = await pb.collection("invitations").getList(1, 1, {
        filter: `slug = "${clean}" ${invitationId ? `&& id != "${invitationId}"` : ""}`,
      });
      setSlugAvailable(existing.totalItems === 0);
    } catch (_) {
      setSlugAvailable(true);
    }
  }

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  function updateGroom(field, value) {
    setContent((prev) => ({
      ...prev,
      groom: { ...prev.groom, [field]: value },
    }));
  }

  function updateBride(field, value) {
    setContent((prev) => ({
      ...prev,
      bride: { ...prev.bride, [field]: value },
    }));
  }

  function updateEvent(index, field, value) {
    setContent((prev) => {
      const newEvents = [...(prev.events || [])];
      newEvents[index] = { ...newEvents[index], [field]: value };
      return { ...prev, events: newEvents };
    });
  }

  function addEvent() {
    setContent((prev) => ({
      ...prev,
      events: [
        ...(prev.events || []),
        {
          name: "Acara Tambahan",
          date: eventDate,
          time_start: "18:00",
          time_end: "21:00",
          timezone: "WIB",
          location_name: "",
          location_address: "",
          maps_url: "",
        },
      ],
    }));
  }

  function removeEvent(index) {
    setContent((prev) => ({
      ...prev,
      events: prev.events.filter((_, i) => i !== index),
    }));
  }

  function updateBank(index, field, value) {
    setContent((prev) => {
      const newBanks = [...(prev.digital_envelope || [])];
      newBanks[index] = { ...newBanks[index], [field]: value };
      return { ...prev, digital_envelope: newBanks };
    });
  }

  function addBank() {
    setContent((prev) => ({
      ...prev,
      digital_envelope: [
        ...(prev.digital_envelope || []),
        { bank: "BCA", account_number: "", account_holder: "" },
      ],
    }));
  }

  function removeBank(index) {
    setContent((prev) => ({
      ...prev,
      digital_envelope: prev.digital_envelope.filter((_, i) => i !== index),
    }));
  }

  // Save Draft (Local + PocketBase)
  async function handleSaveDraft() {
    if (!title.trim()) {
      setError("Judul undangan wajib diisi.");
      return null;
    }
    if (!slug.trim()) {
      setError("Slug URL wajib diisi.");
      return null;
    }

    setSaving(true);
    setError("");
    setNotice("");

    // Save to local storage as fallback
    try {
      localStorage.setItem(
        "trimi_invitation_draft",
        JSON.stringify({ title, slug, content })
      );
    } catch (_) {}

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("slug", slug.trim().toLowerCase());
      formData.append("template", selectedTemplateId);
      formData.append("event_type", eventType);
      formData.append("event_date", eventDate ? `${eventDate} 00:00:00.000Z` : "");
      formData.append("content_data", JSON.stringify(content));
      formData.append("rsvp_enabled", rsvpEnabled);
      formData.append("music_url", musicUrl);

      if (coverFile) formData.append("cover_image", coverFile);
      if (musicFile) formData.append("music_file", musicFile);

      let record;
      if (invitationId) {
        record = await pb.collection("invitations").update(invitationId, formData);
      } else {
        formData.append("payment_status", "unpaid");
        formData.append("is_active", false);
        formData.append("view_count", 0);
        record = await pb.collection("invitations").create(formData);
        setInvitationId(record.id);
      }

      setNotice("Draft undangan berhasil disimpan!");
      setTimeout(() => setNotice(""), 3000);
      return record;
    } catch (err) {
      console.error("Gagal menyimpan draft:", err);
      setError(err?.response?.message || err?.message || "Gagal menyimpan draft ke server.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  // Checkout & Place Order (Pay-per-invitation)
  async function handlePlaceOrder() {
    const savedRecord = await handleSaveDraft();
    if (!savedRecord) return;

    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Nama pemesan dan nomor WhatsApp wajib diisi pada formulir pesanan.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const orderNumber = `INV-UND-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`;
      const amount = Number(selectedTemplate?.base_price || 99000);

      const orderData = new FormData();
      orderData.append("order_number", orderNumber);
      orderData.append("invitation", savedRecord.id);
      orderData.append("customer_name", customerName.trim());
      orderData.append("customer_phone", customerPhone.trim());
      orderData.append("customer_email", customerEmail.trim());
      orderData.append("amount", amount);
      orderData.append("payment_status", "pending");
      orderData.append("payment_method", paymentMethod);

      if (paymentProofFile) {
        orderData.append("payment_proof", paymentProofFile);
      }

      const createdOrder = await pb.collection("invitation_orders").create(orderData);
      setCurrentOrder(createdOrder);
      setNotice(`Pesanan berhasil dibuat (${orderNumber})! Silakan lakukan transfer dan upload bukti.`);
    } catch (err) {
      console.error("Gagal membuat pesanan:", err);
      setError(err?.message || "Gagal membuat pesanan.");
    } finally {
      setSaving(false);
    }
  }

  // Staff direct publish
  async function handleStaffDirectPublish() {
    if (!isStaff) return;
    const savedRecord = await handleSaveDraft();
    if (!savedRecord) return;

    setSaving(true);
    try {
      await pb.send("/api/trimi/invitations/publish", {
        body: {
          invitationId: savedRecord.id,
          orderId: currentOrder?.id || "",
        },
      });

      setPaymentStatus("paid");
      setIsActive(true);
      setNotice("Undangan berhasil diterbitkan! Tautan publik telah aktif.");
    } catch (err) {
      setError("Gagal menerbitkan undangan: " + (err?.message || ""));
    } finally {
      setSaving(false);
    }
  }

  // Invitation object for live preview
  const previewInvitationData = {
    id: invitationId || "temp-id",
    title: title,
    slug: slug,
    event_type: eventType,
    event_date: eventDate,
    rsvp_enabled: rsvpEnabled,
    content_data: content,
  };

  const tabs = [
    { id: "template", label: "Template" },
    { id: "couple", label: "Mempelai" },
    { id: "events", label: "Rangkaian Acara" },
    { id: "story", label: "Kisah & Doa" },
    { id: "gifts", label: "Amplop Digital" },
    { id: "settings", label: "Tautan / Slug" },
    { id: "payment", label: "Penerbitan & Pembayaran" },
  ];

  return (
    <div className="editor-page-wrapper">
      {/* Editor Top Navigation */}
      <header className="editor-topbar">
        <div className="topbar-left">
          <Link to="/invitations" className="back-link">
            <ArrowLeft size={18} />
            <span>Katalog</span>
          </Link>
          <div className="topbar-title-box">
            <h2>{title || "Editor Undangan Digital"}</h2>
            <div className="topbar-badges">
              <span className={`status-pill ${paymentStatus}`}>
                {paymentStatus === "paid" ? "Lunas (Terbit)" : "Belum Lunas (Draft)"}
              </span>
              {slug && (
                <span className="slug-badge">
                  /i/{slug}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="topbar-right">
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`btn-toggle-preview ${showLivePreview ? "active" : ""}`}
          >
            <Smartphone size={18} />
            <span>{showLivePreview ? "Tutup Preview" : "Lihat Preview"}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="btn-save-draft"
          >
            <Save size={18} />
            <span>{saving ? "Menyimpan..." : "Simpan Draft"}</span>
          </button>

          {isStaff && (
            <button
              type="button"
              onClick={handleStaffDirectPublish}
              disabled={saving}
              className="btn-staff-publish"
            >
              <ShieldCheck size={18} />
              <span>Verifikasi & Terbitkan</span>
            </button>
          )}

          {paymentStatus === "paid" && slug && (
            <a
              href={`/i/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="btn-view-public"
            >
              <Eye size={18} />
              <span>Buka Publik</span>
            </a>
          )}
        </div>
      </header>

      {/* Notifications */}
      {notice && (
        <div className="editor-banner-notice">
          <Check size={18} />
          <span>{notice}</span>
        </div>
      )}
      {error && (
        <div className="editor-banner-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Workspace Split Layout */}
      <div className={`editor-workspace ${showLivePreview ? "with-preview" : ""}`}>
        {/* Left / Center Form Panel */}
        <div className="editor-form-panel">
          {/* Tabs Navigation */}
          <nav className="editor-tabs-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="editor-tab-content">
            {/* 1. Tab: Template & Info Acara */}
            {activeTab === "template" && (
              <div className="tab-pane">
                <div className="pane-header">
                  <h3>Pilih Desain Template</h3>
                  <p>Template dapat diubah kapan saja tanpa menghapus data formulir yang sudah Anda isi.</p>
                </div>

                <div className="template-picker-grid">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className={`picker-card ${selectedTemplateId === tpl.id ? "selected" : ""}`}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                    >
                      <div className="picker-radio">
                        <span className="dot"></span>
                      </div>
                      <div className="picker-body">
                        <strong>{tpl.name}</strong>
                        <p>{tpl.description}</p>
                        <span className="picker-price">
                          Rp {Number(tpl.base_price).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-group-divider"></div>

                <div className="pane-header">
                  <h3>Judul & Tanggal Utama Acara</h3>
                </div>

                <div className="form-grid-2">
                  <div className="input-group">
                    <label>Judul Undangan *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: The Wedding of Gilang & Dinda"
                    />
                  </div>

                  <div className="input-group">
                    <label>Tanggal Utama Acara *</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="tab-actions-footer">
                  <button
                    type="button"
                    onClick={() => setActiveTab("couple")}
                    className="btn-next-step"
                  >
                    <span>Lanjut ke Data Mempelai</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* 2. Tab: Mempelai */}
            {activeTab === "couple" && (
              <div className="tab-pane">
                <div className="pane-header">
                  <h3>Data Mempelai / Tokoh Acara</h3>
                  <p>Masukkan informasi kedua mempelai atau pihak yang berbahagia.</p>
                </div>

                <div className="form-columns-2">
                  {/* Mempelai Pria */}
                  <div className="profile-edit-box">
                    <div className="box-title">
                      <Heart size={18} />
                      <h4>Mempelai Pria</h4>
                    </div>

                    <div className="input-group">
                      <label>Nama Lengkap & Gelar *</label>
                      <input
                        type="text"
                        value={content.groom?.name || ""}
                        onChange={(e) => updateGroom("name", e.target.value)}
                        placeholder="Gilang Pratama, S.T."
                      />
                    </div>

                    <div className="input-group">
                      <label>Nama Panggilan *</label>
                      <input
                        type="text"
                        value={content.groom?.nickname || ""}
                        onChange={(e) => updateGroom("nickname", e.target.value)}
                        placeholder="Gilang"
                      />
                    </div>

                    <div className="input-group">
                      <label>Keterangan Orang Tua</label>
                      <input
                        type="text"
                        value={content.groom?.parents || ""}
                        onChange={(e) => updateGroom("parents", e.target.value)}
                        placeholder="Putra pertama dari Bpk. Bambang & Ibu Siti"
                      />
                    </div>

                    <div className="input-group">
                      <label>Instagram Username</label>
                      <input
                        type="text"
                        value={content.groom?.instagram || ""}
                        onChange={(e) => updateGroom("instagram", e.target.value)}
                        placeholder="gilangpratama"
                      />
                    </div>
                  </div>

                  {/* Mempelai Wanita */}
                  <div className="profile-edit-box">
                    <div className="box-title">
                      <Heart size={18} />
                      <h4>Mempelai Wanita</h4>
                    </div>

                    <div className="input-group">
                      <label>Nama Lengkap & Gelar *</label>
                      <input
                        type="text"
                        value={content.bride?.name || ""}
                        onChange={(e) => updateBride("name", e.target.value)}
                        placeholder="Dinda Larasati, S.Ds."
                      />
                    </div>

                    <div className="input-group">
                      <label>Nama Panggilan *</label>
                      <input
                        type="text"
                        value={content.bride?.nickname || ""}
                        onChange={(e) => updateBride("nickname", e.target.value)}
                        placeholder="Dinda"
                      />
                    </div>

                    <div className="input-group">
                      <label>Keterangan Orang Tua</label>
                      <input
                        type="text"
                        value={content.bride?.parents || ""}
                        onChange={(e) => updateBride("parents", e.target.value)}
                        placeholder="Putri kedua dari Bpk. Hendro & Ibu Sri"
                      />
                    </div>

                    <div className="input-group">
                      <label>Instagram Username</label>
                      <input
                        type="text"
                        value={content.bride?.instagram || ""}
                        onChange={(e) => updateBride("instagram", e.target.value)}
                        placeholder="dindalarasati"
                      />
                    </div>
                  </div>
                </div>

                <div className="tab-actions-footer">
                  <button
                    type="button"
                    onClick={() => setActiveTab("template")}
                    className="btn-prev-step"
                  >
                    <ArrowLeft size={18} />
                    <span>Kembali</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("events")}
                    className="btn-next-step"
                  >
                    <span>Lanjut ke Rangkaian Acara</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* 3. Tab: Rangkaian Acara */}
            {activeTab === "events" && (
              <div className="tab-pane">
                <div className="pane-header">
                  <div className="header-with-btn">
                    <div>
                      <h3>Rangkaian Acara & Lokasi</h3>
                      <p>Atur sesi acara (Akad, Resepsi, Pemberkatan, Tasyakuran, dll.)</p>
                    </div>
                    <button type="button" onClick={addEvent} className="btn-add-item">
                      <Plus size={16} />
                      <span>Tambah Sesi Acara</span>
                    </button>
                  </div>
                </div>

                <div className="events-editor-list">
                  {(content.events || []).map((evt, idx) => (
                    <div key={idx} className="event-item-card">
                      <div className="event-card-topbar">
                        <h4>Sesi {idx + 1}: {evt.name || "Nama Acara"}</h4>
                        {(content.events || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEvent(idx)}
                            className="btn-delete-item"
                          >
                            <Trash2 size={16} />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>

                      <div className="form-grid-3">
                        <div className="input-group">
                          <label>Nama Sesi Acara *</label>
                          <input
                            type="text"
                            value={evt.name || ""}
                            onChange={(e) => updateEvent(idx, "name", e.target.value)}
                            placeholder="Akad Nikah / Resepsi"
                          />
                        </div>

                        <div className="input-group">
                          <label>Tanggal Acara *</label>
                          <input
                            type="date"
                            value={evt.date || ""}
                            onChange={(e) => updateEvent(idx, "date", e.target.value)}
                          />
                        </div>

                        <div className="input-group">
                          <label>Waktu Acara (Mulai - Selesai)</label>
                          <div className="time-range-row">
                            <input
                              type="time"
                              value={evt.time_start || "08:00"}
                              onChange={(e) => updateEvent(idx, "time_start", e.target.value)}
                            />
                            <span>-</span>
                            <input
                              type="time"
                              value={evt.time_end || "12:00"}
                              onChange={(e) => updateEvent(idx, "time_end", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-grid-2">
                        <div className="input-group">
                          <label>Nama Tempat / Gedung *</label>
                          <input
                            type="text"
                            value={evt.location_name || ""}
                            onChange={(e) => updateEvent(idx, "location_name", e.target.value)}
                            placeholder="Grand Ballroom Hotel Majapahit"
                          />
                        </div>

                        <div className="input-group">
                          <label>Tautan Google Maps</label>
                          <input
                            type="url"
                            value={evt.maps_url || ""}
                            onChange={(e) => updateEvent(idx, "maps_url", e.target.value)}
                            placeholder="https://maps.app.goo.gl/..."
                          />
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Alamat Lengkap Tempat Acara</label>
                        <textarea
                          rows={2}
                          value={evt.location_address || ""}
                          onChange={(e) => updateEvent(idx, "location_address", e.target.value)}
                          placeholder="Jl. Tunjungan No. 65, Tegalsari, Surabaya"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-group-divider"></div>

                <div className="input-group">
                  <label>URL Embed Google Maps (Opsional untuk menampilkan iframe peta)</label>
                  <input
                    type="url"
                    value={content.maps_embed_url || ""}
                    onChange={(e) => setContent({ ...content, maps_embed_url: e.target.value })}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                </div>

                <div className="tab-actions-footer">
                  <button
                    type="button"
                    onClick={() => setActiveTab("couple")}
                    className="btn-prev-step"
                  >
                    <ArrowLeft size={18} />
                    <span>Kembali</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("story")}
                    className="btn-next-step"
                  >
                    <span>Lanjut ke Kisah & Doa</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* 4. Tab: Kisah & Doa */}
            {activeTab === "story" && (
              <div className="tab-pane">
                <div className="pane-header">
                  <h3>Kutipan / Ayat Suci & Perjalanan Cinta</h3>
                </div>

                <div className="input-group">
                  <label>Kutipan Ayat Suci / Puisi Romantis</label>
                  <textarea
                    rows={3}
                    value={content.quote || ""}
                    onChange={(e) => setContent({ ...content, quote: e.target.value })}
                    placeholder="Tuliskan kutipan ayat suci atau kata mutiara..."
                  />
                </div>

                <div className="input-group">
                  <label>Sumber Kutipan (Nama Surat / Penulis)</label>
                  <input
                    type="text"
                    value={content.quote_source || ""}
                    onChange={(e) => setContent({ ...content, quote_source: e.target.value })}
                    placeholder="Q.S. Ar-Rum: 21"
                  />
                </div>

                <div className="form-group-divider"></div>

                <div className="pane-header">
                  <h3>Musik Latar Belakang (Audio)</h3>
                  <p>Musik akan diputar saat tamu membuka undangan secara interaktif.</p>
                </div>

                <div className="input-group">
                  <label>Tautan File Musik (URL MP3 langsung)</label>
                  <input
                    type="url"
                    value={musicUrl}
                    onChange={(e) => setMusicUrl(e.target.value)}
                    placeholder="https://example.com/audio/beautiful-wedding.mp3"
                  />
                </div>

                <div className="input-group">
                  <label>Atau Unggah File MP3 Sendiri (Maks 10MB)</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setMusicFile(e.target.files[0] || null)}
                  />
                  {musicFile && <small className="file-selected-text">File terpilih: {musicFile.name}</small>}
                </div>

                <div className="tab-actions-footer">
                  <button
                    type="button"
                    onClick={() => setActiveTab("events")}
                    className="btn-prev-step"
                  >
                    <ArrowLeft size={18} />
                    <span>Kembali</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("gifts")}
                    className="btn-next-step"
                  >
                    <span>Lanjut ke Amplop Digital</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* 5. Tab: Amplop Digital */}
            {activeTab === "gifts" && (
              <div className="tab-pane">
                <div className="pane-header">
                  <div className="header-with-btn">
                    <div>
                      <h3>Amplop Digital & Kado Fisik</h3>
                      <p>Tamu dapat menyalin nomor rekening bank / e-wallet untuk memberikan tanda kasih.</p>
                    </div>
                    <button type="button" onClick={addBank} className="btn-add-item">
                      <Plus size={16} />
                      <span>Tambah Rekening</span>
                    </button>
                  </div>
                </div>

                <div className="banks-editor-list">
                  {(content.digital_envelope || []).map((bank, idx) => (
                    <div key={idx} className="bank-item-row">
                      <div className="input-group">
                        <label>Nama Bank / E-Wallet</label>
                        <input
                          type="text"
                          value={bank.bank || ""}
                          onChange={(e) => updateBank(idx, "bank", e.target.value)}
                          placeholder="BCA / Mandiri / GoPay"
                        />
                      </div>
                      <div className="input-group">
                        <label>Nomor Rekening / Akun</label>
                        <input
                          type="text"
                          value={bank.account_number || ""}
                          onChange={(e) => updateBank(idx, "account_number", e.target.value)}
                          placeholder="8290123456"
                        />
                      </div>
                      <div className="input-group">
                        <label>Atas Nama (Pemilik)</label>
                        <input
                          type="text"
                          value={bank.account_holder || ""}
                          onChange={(e) => updateBank(idx, "account_holder", e.target.value)}
                          placeholder="Gilang Pratama"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBank(idx)}
                        className="btn-delete-row"
                        title="Hapus rekening"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="form-group-divider"></div>

                <div className="input-group">
                  <label>Alamat Pengiriman Kado Fisik</label>
                  <textarea
                    rows={2}
                    value={content.gift_address || ""}
                    onChange={(e) => setContent({ ...content, gift_address: e.target.value })}
                    placeholder="Contoh: Jl. Rungkut Asri Timur No. 18, Surabaya (Penerima: Gilang - 08123456789)"
                  />
                </div>

                <div className="tab-actions-footer">
                  <button
                    type="button"
                    onClick={() => setActiveTab("story")}
                    className="btn-prev-step"
                  >
                    <ArrowLeft size={18} />
                    <span>Kembali</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("settings")}
                    className="btn-next-step"
                  >
                    <span>Lanjut ke Pengaturan Slug</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* 6. Tab: Pengaturan Slug & RSVP */}
            {activeTab === "settings" && (
              <div className="tab-pane">
                <div className="pane-header">
                  <h3>Tautan Publik & Fitur RSVP</h3>
                  <p>Tentukan alamat URL resmi undangan Anda di domain TriMi.</p>
                </div>

                <div className="input-group">
                  <label>Slug URL Undangan *</label>
                  <div className="slug-input-wrapper">
                    <span className="slug-prefix">trimi.id/i/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                        setSlug(val);
                        checkSlug(val);
                      }}
                      placeholder="gilang-dinda"
                    />
                  </div>
                  {slugAvailable === true && (
                    <small className="slug-status-text success">✓ Tautan /i/{slug} tersedia!</small>
                  )}
                  {slugAvailable === false && (
                    <small className="slug-status-text error">✗ Tautan /i/{slug} sudah dipakai orang lain. Pilih yang lain.</small>
                  )}
                </div>

                <div className="form-group-divider"></div>

                <div className="pane-header">
                  <h3>Pengaturan Buku Tamu & RSVP</h3>
                </div>

                <div className="toggle-setting-row">
                  <div>
                    <strong>Buka Fitur RSVP & Doa Restu</strong>
                    <p>Izinkan tamu undangan mengirimkan konfirmasi kehadiran dan ucapan selamat.</p>
                  </div>
                  <label className="switch-toggle">
                    <input
                      type="checkbox"
                      checked={rsvpEnabled}
                      onChange={(e) => setRsvpEnabled(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="tab-actions-footer">
                  <button
                    type="button"
                    onClick={() => setActiveTab("gifts")}
                    className="btn-prev-step"
                  >
                    <ArrowLeft size={18} />
                    <span>Kembali</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("payment")}
                    className="btn-next-step"
                  >
                    <span>Lanjut ke Pembayaran & Terbit</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* 7. Tab: Pembayaran & Penerbitan */}
            {activeTab === "payment" && (
              <div className="tab-pane">
                <div className="pane-header">
                  <h3>Penerbitan & Pembayaran Undangan</h3>
                  <p>Model bisnis TriMi menggunakan skema bayar per undangan untuk pemeliharaan domain & server.</p>
                </div>

                <div className="order-summary-card">
                  <div className="summary-row">
                    <span>Template Terpilih</span>
                    <strong>{selectedTemplate?.name || "Modern Minimalist"}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Tautan Publik</span>
                    <code>trimi.id/i/{slug || "slug-anda"}</code>
                  </div>
                  <div className="summary-row">
                    <span>Masa Aktif</span>
                    <span>Aktif Selamanya & Bebas Revisi</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row total">
                    <span>Total Biaya Penerbitan</span>
                    <span className="price-total">
                      Rp {Number(selectedTemplate?.base_price || 99000).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {paymentStatus === "paid" ? (
                  <div className="payment-already-paid-card">
                    <Check size={36} className="paid-check-icon" />
                    <h4>Undangan Sudah Berstatus Lunas!</h4>
                    <p>Tautan publik telah aktif dan dapat dibagikan kepada seluruh tamu undangan.</p>
                    <a
                      href={`/i/${slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-open-published"
                    >
                      Buka Undangan: trimi.id/i/{slug}
                    </a>
                  </div>
                ) : (
                  <div className="checkout-form-section">
                    <h4>Formulir Pemesanan & Pembayaran</h4>

                    <div className="form-grid-2">
                      <div className="input-group">
                        <label>Nama Pemesan *</label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Nama lengkap pemesan"
                        />
                      </div>
                      <div className="input-group">
                        <label>Nomor WhatsApp *</label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="08123456789"
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Email Pemesan</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="email@anda.com"
                      />
                    </div>

                    <div className="bank-transfer-instructions">
                      <h5>Metode Pembayaran Transfer Resmi TriMi:</h5>
                      <div className="transfer-accounts-list">
                        <div className="account-box">
                          <strong>BCA Digital</strong>
                          <code>8290 1928 3847</code>
                          <small>a.n. PT TRIMI DIGITAL STUDIO</small>
                        </div>
                        <div className="account-box">
                          <strong>Bank Mandiri</strong>
                          <code>1420 0192 8374 1</code>
                          <small>a.n. PT TRIMI DIGITAL STUDIO</small>
                        </div>
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Unggah Bukti Transfer (Opsional saat checkout awal)</label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setPaymentProofFile(e.target.files[0] || null)}
                      />
                      {paymentProofFile && (
                        <small className="file-selected-text">File bukti: {paymentProofFile.name}</small>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={saving}
                      className="btn-place-order"
                    >
                      <CreditCard size={18} />
                      <span>{saving ? "Memproses..." : "Konfirmasi Pesanan & Simpan Undangan"}</span>
                    </button>

                    {currentOrder && (
                      <div className="order-receipt-box">
                        <FileCheck size={24} className="order-check-icon" />
                        <div>
                          <strong>Pesanan Terdaftar: {currentOrder.order_number}</strong>
                          <p>Status: {currentOrder.payment_status?.toUpperCase()}. Tim TriMi akan memverifikasi pembayaran Anda dan tautan akan langsung aktif.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="tab-actions-footer">
                  <button
                    type="button"
                    onClick={() => setActiveTab("settings")}
                    className="btn-prev-step"
                  >
                    <ArrowLeft size={18} />
                    <span>Kembali</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Live Preview Panel */}
        {showLivePreview && (
          <aside className="editor-preview-panel">
            <div className="preview-panel-header">
              <div className="device-switcher">
                <button
                  type="button"
                  className={`device-btn ${previewDevice === "mobile" ? "active" : ""}`}
                  onClick={() => setPreviewDevice("mobile")}
                  title="Tampilan Ponsel"
                >
                  <Smartphone size={16} />
                  <span>Mobile</span>
                </button>
                <button
                  type="button"
                  className={`device-btn ${previewDevice === "desktop" ? "active" : ""}`}
                  onClick={() => setPreviewDevice("desktop")}
                  title="Tampilan Desktop"
                >
                  <Layers size={16} />
                  <span>Desktop</span>
                </button>
              </div>

              <span className="live-preview-tag">
                <Sparkles size={14} /> Live Sync
              </span>
            </div>

            <div className="preview-scroll-viewport">
              <div className={`preview-frame-container ${previewDevice}`}>
                <TemplateRenderer
                  templateKey={selectedTemplate?.slug || "modern-minimalist"}
                  invitation={previewInvitationData}
                  guestName="Bapak / Ibu Tamu Terhormat"
                  rsvps={[]}
                  onRsvpSubmit={async () => {
                    alert("Mode pratinjau: formulir berfungsi penuh saat undangan diterbitkan.");
                  }}
                />
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
