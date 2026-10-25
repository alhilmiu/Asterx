import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Users,
  CreditCard,
  Sparkles,
  Layers,
  FileCheck,
  AlertCircle,
  X,
  FileText,
  DollarSign
} from "lucide-react";
import { pb } from "../lib/pocketbase";
import "./AdminInvitationsPage.css";

export default function AdminInvitationsPage() {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [orders, setOrders] = useState([]);
  const [rsvps, setRsvps] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPayment, setFilterPayment] = useState("all");
  const [activeTab, setActiveTab] = useState("invitations"); // invitations, templates, orders

  // Modals
  const [selectedRsvpInvitation, setSelectedRsvpInvitation] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmPublishId, setConfirmPublishId] = useState(null);

  const [actionNotice, setActionNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setActionError("");
    try {
      const [invRes, tplRes, orderRes, rsvpRes] = await Promise.all([
        pb.collection("invitations").getList(1, 200, {
          sort: "-created",
          expand: "template",
          requestKey: null,
        }),
        pb.collection("invitation_templates").getList(1, 100, {
          sort: "sort_order,name",
          requestKey: null,
        }),
        pb.collection("invitation_orders").getList(1, 200, {
          sort: "-created",
          expand: "invitation",
          requestKey: null,
        }),
        pb.collection("invitation_rsvps").getList(1, 500, {
          sort: "-created",
          requestKey: null,
        }),
      ]);

      setInvitations(invRes.items);
      setTemplates(tplRes.items);
      setOrders(orderRes.items);
      setRsvps(rsvpRes.items);
    } catch (err) {
      console.error("Gagal memuat data undangan admin:", err);
      setActionError("Gagal memuat data dari PocketBase: " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Publish / Verify Payment
  async function handleVerifyAndPublish(invitationId, orderId) {
    setActionError("");
    setActionNotice("");
    try {
      await pb.send("/api/trimi/invitations/publish", {
        method: "POST",
        body: {
          invitationId,
          orderId: orderId || ""
        }
      });

      setActionNotice("Undangan berhasil diterbitkan dan status pembayaran diset Lunas!");
      setConfirmPublishId(null);
      setSelectedOrder(null);
      await loadData();
    } catch (err) {
      console.error("Gagal menerbitkan undangan:", err);
      setActionError("Gagal menerbitkan: " + (err?.message || ""));
    }
  }

  // Toggle Template Active
  async function handleToggleTemplate(tpl) {
    try {
      await pb.collection("invitation_templates").update(tpl.id, {
        is_active: !tpl.is_active,
      });
      await loadData();
    } catch (err) {
      alert("Gagal mengubah status template: " + (err?.message || ""));
    }
  }

  // Toggle Invitation Active
  async function handleToggleInvitationActive(inv) {
    try {
      await pb.collection("invitations").update(inv.id, {
        is_active: !inv.is_active,
      });
      await loadData();
    } catch (err) {
      alert("Gagal mengubah status aktif: " + (err?.message || ""));
    }
  }

  // Delete Invitation
  async function handleDeleteInvitation(id, title) {
    if (!window.confirm(`Yakin ingin menghapus undangan "${title}"? Seluruh data RSVP terkait juga akan terhapus.`)) {
      return;
    }

    try {
      await pb.collection("invitations").delete(id);
      await loadData();
    } catch (err) {
      alert("Gagal menghapus undangan: " + (err?.message || ""));
    }
  }

  // Filtered invitations
  const filteredInvitations = invitations.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      (item.title || "").toLowerCase().includes(q) ||
      (item.slug || "").toLowerCase().includes(q);
    const matchPay =
      filterPayment === "all" || item.payment_status === filterPayment;
    return matchSearch && matchPay;
  });

  // Calculate Stats
  const totalInvitations = invitations.length;
  const paidInvitations = invitations.filter((i) => i.payment_status === "paid").length;
  const unpaidInvitations = invitations.filter((i) => i.payment_status !== "paid").length;
  const totalRsvpsCount = rsvps.length;

  return (
    <div className="admin-page-container">
      {/* Page Heading */}
      <div className="page-header-row">
        <div>
          <span className="eyebrow">DIGITAL INVITATIONS</span>
          <h1>Manajemen Undangan Digital</h1>
          <p className="muted">
            Kelola katalog template, terbitkan undangan berbayar, dan pantau rekapitulasi RSVP.
          </p>
        </div>

        <div className="header-action-btns">
          <button type="button" onClick={loadData} className="btn-secondary-action">
            <RefreshCw size={16} />
            <span>Segarkan</span>
          </button>
          <Link to="/invitations/editor" className="btn-primary-action">
            <Plus size={16} />
            <span>Buat Undangan Baru</span>
          </Link>
        </div>
      </div>

      {/* Action Messages */}
      {actionNotice && (
        <div className="admin-alert-banner success">
          <CheckCircle size={18} />
          <span>{actionNotice}</span>
        </div>
      )}
      {actionError && (
        <div className="admin-alert-banner error">
          <AlertCircle size={18} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="stats-cards-grid">
        <div className="stat-card">
          <span className="stat-label">Total Undangan</span>
          <strong className="stat-value">{totalInvitations}</strong>
          <small className="stat-sub">{paidInvitations} telah lunas & terbit</small>
        </div>
        <div className="stat-card">
          <span className="stat-label">Menunggu Pembayaran</span>
          <strong className="stat-value text-amber-500">{unpaidInvitations}</strong>
          <small className="stat-sub">Pesanan / draft yang belum diverifikasi</small>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total RSVP Masuk</span>
          <strong className="stat-value text-indigo-400">{totalRsvpsCount}</strong>
          <small className="stat-sub">Konfirmasi kehadiran & ucapan doa</small>
        </div>
        <div className="stat-card">
          <span className="stat-label">Template Aktif</span>
          <strong className="stat-value text-emerald-400">
            {templates.filter((t) => t.is_active).length} / {templates.length}
          </strong>
          <small className="stat-sub">Siap dipilih di katalog publik</small>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs-nav">
        <button
          type="button"
          className={`tab-link ${activeTab === "invitations" ? "active" : ""}`}
          onClick={() => setActiveTab("invitations")}
        >
          Daftar Undangan ({invitations.length})
        </button>
        <button
          type="button"
          className={`tab-link ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          Pesanan & Pembayaran ({orders.length})
        </button>
        <button
          type="button"
          className={`tab-link ${activeTab === "templates" ? "active" : ""}`}
          onClick={() => setActiveTab("templates")}
        >
          Kelola Template ({templates.length})
        </button>
      </div>

      {/* TAB 1: DAFTAR UNDANGAN */}
      {activeTab === "invitations" && (
        <div className="admin-card-surface">
          {/* Filters Bar */}
          <div className="table-filters-bar">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari judul atau slug undangan..."
              />
            </div>

            <div className="filter-select-box">
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
              >
                <option value="all">Semua Status Pembayaran</option>
                <option value="paid">Lunas (Paid)</option>
                <option value="unpaid">Belum Lunas (Unpaid)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="table-loading-row">Memuat daftar undangan...</div>
          ) : filteredInvitations.length === 0 ? (
            <div className="table-empty-row">
              <p>Tidak ada data undangan yang sesuai.</p>
            </div>
          ) : (
            <div className="responsive-table-wrap">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Undangan / Slug</th>
                    <th>Template</th>
                    <th>Tanggal Acara</th>
                    <th>Status Pembayaran</th>
                    <th>Status Aktif</th>
                    <th>RSVP</th>
                    <th>Tayangan</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvitations.map((inv) => {
                    const invRsvps = rsvps.filter((r) => r.invitation === inv.id);
                    const tpl = templates.find((t) => t.id === inv.template) || inv.expand?.template;

                    return (
                      <tr key={inv.id}>
                        <td>
                          <strong>{inv.title}</strong>
                          <div className="sub-slug-link">
                            <code>/i/{inv.slug}</code>
                            {inv.payment_status === "paid" && (
                              <a href={`/i/${inv.slug}`} target="_blank" rel="noreferrer">
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="badge-tpl">{tpl?.name || "Standard"}</span>
                        </td>
                        <td>
                          {inv.event_date ? new Date(inv.event_date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          }) : "—"}
                        </td>
                        <td>
                          {inv.payment_status === "paid" ? (
                            <span className="badge-status-paid">✓ Lunas</span>
                          ) : (
                            <span className="badge-status-unpaid">⏳ Belum Lunas</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleToggleInvitationActive(inv)}
                            className={`toggle-badge-btn ${inv.is_active ? "active" : "inactive"}`}
                          >
                            {inv.is_active ? "Aktif" : "Nonaktif"}
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => setSelectedRsvpInvitation({ invitation: inv, list: invRsvps })}
                            className="rsvp-count-btn"
                          >
                            <Users size={14} />
                            <span>{invRsvps.length} Tamu</span>
                          </button>
                        </td>
                        <td>{Number(inv.view_count || 0)}x</td>
                        <td className="text-right">
                          <div className="action-buttons-group">
                            {inv.payment_status !== "paid" && (
                              <button
                                type="button"
                                onClick={() => handleVerifyAndPublish(inv.id)}
                                className="action-btn-publish"
                                title="Verifikasi Lunas & Terbitkan"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => navigate(`/invitations/editor/${inv.id}`)}
                              className="action-btn-edit"
                              title="Edit Undangan"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteInvitation(inv.id, inv.title)}
                              className="action-btn-delete"
                              title="Hapus Undangan"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PESANAN & PEMBAYARAN */}
      {activeTab === "orders" && (
        <div className="admin-card-surface">
          <div className="pane-info-bar">
            <h3>Daftar Pesanan Pay-per-invitation</h3>
            <p>Verifikasi bukti pembayaran transfer yang dikirimkan pemesan sebelum menerbitkan undangan.</p>
          </div>

          {orders.length === 0 ? (
            <div className="table-empty-row">Belum ada pesanan masuk.</div>
          ) : (
            <div className="responsive-table-wrap">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>No. Pesanan</th>
                    <th>Nama Pemesan & Kontak</th>
                    <th>Undangan Terkait</th>
                    <th>Nominal</th>
                    <th>Metode</th>
                    <th>Status Pesanan</th>
                    <th>Bukti Transfer</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => {
                    const inv = invitations.find((i) => i.id === ord.invitation) || ord.expand?.invitation;
                    let proofUrl = "";
                    if (ord.payment_proof) {
                      proofUrl = pb.files.getURL(ord, ord.payment_proof);
                    }

                    return (
                      <tr key={ord.id}>
                        <td>
                          <strong>{ord.order_number}</strong>
                          <small className="block text-gray-400">
                            {new Date(ord.created).toLocaleDateString("id-ID")}
                          </small>
                        </td>
                        <td>
                          <strong>{ord.customer_name}</strong>
                          <div className="text-sm text-gray-400">{ord.customer_phone}</div>
                          {ord.customer_email && <small className="text-gray-500">{ord.customer_email}</small>}
                        </td>
                        <td>
                          {inv ? (
                            <div>
                              <span>{inv.title}</span>
                              <code className="block text-xs text-indigo-400">/i/{inv.slug}</code>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <strong className="text-emerald-400">
                            Rp {Number(ord.amount || 0).toLocaleString("id-ID")}
                          </strong>
                        </td>
                        <td>
                          <span className="badge-tpl">{ord.payment_method?.toUpperCase()}</span>
                        </td>
                        <td>
                          {ord.payment_status === "paid" ? (
                            <span className="badge-status-paid">✓ Terverifikasi</span>
                          ) : (
                            <span className="badge-status-unpaid">⏳ Menunggu Verifikasi</span>
                          )}
                        </td>
                        <td>
                          {proofUrl ? (
                            <a
                              href={proofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="view-proof-link"
                            >
                              <FileText size={14} />
                              <span>Lihat Bukti</span>
                            </a>
                          ) : (
                            <span className="text-gray-500 text-xs">Belum diunggah</span>
                          )}
                        </td>
                        <td className="text-right">
                          {ord.payment_status !== "paid" && (
                            <button
                              type="button"
                              onClick={() => handleVerifyAndPublish(ord.invitation, ord.id)}
                              className="btn-verify-order"
                            >
                              <CheckCircle size={14} />
                              <span>Konfirmasi Lunas</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: KELOLA TEMPLATE */}
      {activeTab === "templates" && (
        <div className="admin-card-surface">
          <div className="pane-info-bar">
            <h3>Daftar Template Undangan TriMi</h3>
            <p>Atur status publikasi template yang tersedia bagi pelanggan di katalog.</p>
          </div>

          <div className="responsive-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Nama Template</th>
                  <th>Slug & Kategori</th>
                  <th>Harga Dasar</th>
                  <th>Status Katalog</th>
                  <th>Urutan</th>
                  <th className="text-right">Kontrol</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((tpl) => (
                  <tr key={tpl.id}>
                    <td>
                      <strong>{tpl.name}</strong>
                      <p className="text-xs text-gray-400 m-0">{tpl.description}</p>
                    </td>
                    <td>
                      <code>{tpl.slug}</code>
                      <span className="badge-tpl ml-2">{tpl.category}</span>
                    </td>
                    <td>
                      <strong className="text-emerald-400">
                        Rp {Number(tpl.base_price || 0).toLocaleString("id-ID")}
                      </strong>
                    </td>
                    <td>
                      {tpl.is_active ? (
                        <span className="badge-status-paid">Aktif</span>
                      ) : (
                        <span className="badge-status-unpaid">Nonaktif</span>
                      )}
                    </td>
                    <td>{tpl.sort_order || 0}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleTemplate(tpl)}
                        className={`toggle-template-btn ${tpl.is_active ? "deactivate" : "activate"}`}
                      >
                        {tpl.is_active ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: REKAP RSVP */}
      {selectedRsvpInvitation && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <div>
                <h3>Rekapitulasi Tamu & RSVP</h3>
                <p className="text-sm text-gray-400">
                  {selectedRsvpInvitation.invitation.title} (/i/{selectedRsvpInvitation.invitation.slug})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRsvpInvitation(null)}
                className="admin-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="rsvp-stats-mini-row">
                <div className="mini-stat">
                  <span>Total RSVP:</span>
                  <strong>{selectedRsvpInvitation.list.length}</strong>
                </div>
                <div className="mini-stat">
                  <span>Hadir:</span>
                  <strong className="text-emerald-400">
                    {selectedRsvpInvitation.list.filter((r) => r.attendance === "attending").length}
                  </strong>
                </div>
                <div className="mini-stat">
                  <span>Tidak Hadir:</span>
                  <strong className="text-gray-400">
                    {selectedRsvpInvitation.list.filter((r) => r.attendance === "not_attending").length}
                  </strong>
                </div>
                <div className="mini-stat">
                  <span>Masih Ragu:</span>
                  <strong className="text-amber-400">
                    {selectedRsvpInvitation.list.filter((r) => r.attendance === "tentative").length}
                  </strong>
                </div>
              </div>

              {selectedRsvpInvitation.list.length === 0 ? (
                <div className="table-empty-row">Belum ada tamu yang mengirimkan konfirmasi.</div>
              ) : (
                <div className="modal-scrollable-table">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Nama Tamu</th>
                        <th>Kehadiran</th>
                        <th>Jumlah</th>
                        <th>Doa & Ucapan</th>
                        <th>Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRsvpInvitation.list.map((item) => (
                        <tr key={item.id}>
                          <td><strong>{item.guest_name}</strong></td>
                          <td>
                            {item.attendance === "attending" && <span className="badge-status-paid">Hadir</span>}
                            {item.attendance === "not_attending" && <span className="badge-status-unpaid">Tidak Hadir</span>}
                            {item.attendance === "tentative" && <span className="badge-tpl">Masih Ragu</span>}
                          </td>
                          <td>{item.guest_count || 1} orang</td>
                          <td>
                            <p className="rsvp-wishes-text">{item.wishes_message || "—"}</p>
                          </td>
                          <td>
                            <small className="text-gray-400">
                              {item.created ? new Date(item.created).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit"
                              }) : "—"}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
