import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  HelpCircle,
} from "lucide-react";
import "./CostEstimator.css";

const projectTypes = [
  {
    id: "landing",
    name: "Landing Page",
    badge: "Populer untuk Iklan",
    basePrice: 1500000,
    baseDays: 4,
    description: "Satu halaman berkonversi tinggi, fokus jualan produk atau promosi penawaran khusus.",
  },
  {
    id: "business",
    name: "Website Bisnis / Profil",
    badge: "Paling Diminati",
    basePrice: 2800000,
    baseDays: 8,
    description: "Multi-halaman profesional untuk memperkenalkan profil perusahaan, layanan, dan portofolio.",
  },
  {
    id: "catalog",
    name: "E-Commerce / Katalog",
    badge: "Toko Digital",
    basePrice: 4500000,
    baseDays: 12,
    description: "Katalog produk interaktif dengan pencarian, filter, dan alur order WhatsApp/Checkout.",
  },
  {
    id: "custom",
    name: "Custom Web Application",
    badge: "Solusi Spesifik",
    basePrice: 7500000,
    baseDays: 18,
    description: "Sistem aplikasi web khusus dengan database PocketBase, alur kerja bisnis, dan logic custom.",
  },
];

const availableFeatures = [
  {
    id: "cms",
    name: "Admin Panel & CMS (PocketBase)",
    price: 750000,
    extraDays: 2,
    desc: "Bisa ubah isi tulisan, gambar, dan portfolio sendiri kapan saja tanpa menyentuh kodingan.",
  },
  {
    id: "seo",
    name: "Paket SEO On-Page & Google Indexing",
    price: 500000,
    extraDays: 1,
    desc: "Optimasi meta tag, sitemap, OpenGraph media sosial, dan verifikasi Google Search Console.",
  },
  {
    id: "3d",
    name: "Visual 3D Interaktif / Framer Motion Khusus",
    price: 1200000,
    extraDays: 3,
    desc: "Elemen interaktif 3D (Three.js) atau mikro animasi memikat yang bikin web beda dari kompetitor.",
  },
  {
    id: "tracking",
    name: "Fitur Live Order Tracking untuk Klien",
    price: 600000,
    extraDays: 2,
    desc: "Berikan klien link rahasia untuk memantau status pesanan dan tahap pengerjaan secara real-time.",
  },
  {
    id: "payment",
    name: "Integrasi Payment Gateway Otomatis",
    price: 1000000,
    extraDays: 2,
    desc: "Menerima QRIS, Virtual Account bank, dan e-wallet secara otomatis dengan notifikasi instan.",
  },
  {
    id: "multilang",
    name: "Multi-Bahasa (Indonesia & Inggris)",
    price: 800000,
    extraDays: 2,
    desc: "Dukungan beralih bahasa (ID/EN) untuk menjangkau klien internasional.",
  },
];

export default function CostEstimator({ whatsappNumber = "" }) {
  const [selectedType, setSelectedType] = useState(projectTypes[1]);
  const [selectedFeatures, setSelectedFeatures] = useState(["cms", "seo"]);

  const toggleFeature = (id) => {
    if (selectedFeatures.includes(id)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== id));
    } else {
      setSelectedFeatures([...selectedFeatures, id]);
    }
  };

  // Kalkulasi total
  const featuresTotal = selectedFeatures.reduce((acc, featId) => {
    const feat = availableFeatures.find((f) => f.id === featId);
    return acc + (feat ? feat.price : 0);
  }, 0);

  const extraDaysTotal = selectedFeatures.reduce((acc, featId) => {
    const feat = availableFeatures.find((f) => f.id === featId);
    return acc + (feat ? feat.extraDays : 0);
  }, 0);

  const totalPrice = selectedType.basePrice + featuresTotal;
  const totalDays = selectedType.baseDays + extraDaysTotal;

  // Format Rupiah
  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Generate WA Message
  const featureNames = selectedFeatures
    .map((fId) => availableFeatures.find((f) => f.id === fId)?.name)
    .filter(Boolean);

  const waText = encodeURIComponent(
    `Halo TriMi! Saya telah menghitung estimasi kebutuhan website di website Anda:\n\n` +
      `📌 *Tipe Proyek:* ${selectedType.name}\n` +
      `⚡ *Fitur Pilihan:* ${featureNames.length > 0 ? featureNames.join(", ") : "Standar"}\n` +
      `💰 *Estimasi Biaya:* ${formatRupiah(totalPrice)}\n` +
      `⏱️ *Estimasi Pengerjaan:* ~${totalDays} Hari Kerja\n\n` +
      `Bisa kita diskusikan lebih lanjut untuk detail pengerjaannya? Terima kasih.`
  );

  const waTarget = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${waText}`
    : `https://wa.me/?text=${waText}`;

  return (
    <section className="cost-estimator-section" id="kalkulator">
      <div className="trimi-section-heading">
        <div>
          <span className="trimi-eyebrow">
            <Calculator size={14} /> TRANSPARAN & TANPA BIAYA TERSEMBUNYI
          </span>
          <h2>
            Hitung Estimasi Proyek
            <br />
            <span>Sesuai Kebutuhanmu.</span>
          </h2>
        </div>
        <p>
          Dapatkan gambaran biaya dan estimasi waktu secara instan. Sesuaikan
          tipe website dan fitur yang Anda inginkan sebelum memulai konsultasi.
        </p>
      </div>

      <div className="estimator-layout">
        {/* Kolom Kiri: Pilihan Tipe & Fitur */}
        <div className="estimator-controls">
          {/* Langkah 1: Pilih Tipe */}
          <div className="estimator-group">
            <div className="group-title">
              <span className="step-badge">1</span>
              <div>
                <h3>Pilih Jenis Website</h3>
                <p>Sesuaikan dengan tujuan dan skala bisnis Anda saat ini</p>
              </div>
            </div>

            <div className="project-type-grid">
              {projectTypes.map((type) => {
                const isSelected = selectedType.id === type.id;
                return (
                  <motion.div
                    key={type.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`type-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedType(type)}
                  >
                    <div className="type-card-header">
                      <span className="type-badge">{type.badge}</span>
                      <span className="type-price">
                        Mulai {formatRupiah(type.basePrice)}
                      </span>
                    </div>
                    <h4>{type.name}</h4>
                    <p>{type.description}</p>
                    <div className="type-days">
                      <Clock size={13} /> Estimasi dasar ~{type.baseDays} hari
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Langkah 2: Tambah Fitur */}
          <div className="estimator-group">
            <div className="group-title">
              <span className="step-badge">2</span>
              <div>
                <h3>Pilih Fitur Tambahan (Opsional)</h3>
                <p>Tingkatkan performa dan kemampuan website Anda</p>
              </div>
            </div>

            <div className="features-grid">
              {availableFeatures.map((feat) => {
                const checked = selectedFeatures.includes(feat.id);
                return (
                  <label
                    key={feat.id}
                    className={`feature-item ${checked ? "active" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFeature(feat.id)}
                    />
                    <div className="feature-custom-checkbox">
                      {checked && <CheckCircle2 size={16} />}
                    </div>
                    <div className="feature-content">
                      <div className="feature-top">
                        <span className="feature-name">{feat.name}</span>
                        <span className="feature-price">
                          +{formatRupiah(feat.price)}
                        </span>
                      </div>
                      <p className="feature-desc">{feat.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Summary Card */}
        <aside className="estimator-summary-panel">
          <div className="summary-card">
            <div className="summary-badge">
              <Sparkles size={14} /> RINGKASAN ESTIMASI
            </div>

            <div className="summary-price-box">
              <span className="label">Estimasi Investasi:</span>
              <div className="price-value">{formatRupiah(totalPrice)}</div>
              <span className="vat-note">*Bisa disesuaikan setelah brief detail</span>
            </div>

            <div className="summary-details">
              <div className="detail-row">
                <span>Tipe Proyek</span>
                <strong>{selectedType.name}</strong>
              </div>
              <div className="detail-row">
                <span>Estimasi Waktu</span>
                <strong>~{totalDays} Hari Kerja</strong>
              </div>
              <div className="detail-row">
                <span>Fitur Tambahan</span>
                <strong>{selectedFeatures.length} Dipilih</strong>
              </div>
            </div>

            <div className="included-perks">
              <span className="perks-title">Sudah Termasuk Dalam Semua Paket:</span>
              <ul>
                <li>
                  <CheckCircle2 size={14} className="perk-icon" /> Gratis Domain .com & Hosting Cepat 1 Tahun
                </li>
                <li>
                  <CheckCircle2 size={14} className="perk-icon" /> 100% Responsif di Smartphone & Tablet
                </li>
                <li>
                  <CheckCircle2 size={14} className="perk-icon" /> Garansi Perbaikan Bug & Revisi
                </li>
                <li>
                  <CheckCircle2 size={14} className="perk-icon" /> Akses Kode Sumber Penuh & Bebas Biaya Langganan Bulanan
                </li>
              </ul>
            </div>

            <a
              href={waTarget}
              target="_blank"
              rel="noopener noreferrer"
              className="trimi-button-primary estimator-submit-btn"
            >
              <span>Konsultasikan Rincian Ini</span>
              <Send size={15} />
            </a>

            <p className="summary-guarantee">
              <ShieldCheck size={14} /> Bebas konsultasi gratis tanpa komitmen
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
