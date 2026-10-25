import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Eye,
  Key,
} from "lucide-react";
import "./LiveTrackingShowcase.css";

const trackingMilestones = [
  {
    step: "01",
    title: "Brief & Arsitektur Website",
    status: "completed",
    date: "14 Okt 2026",
    desc: "Perumusan struktur menu, target pengunjung, dan skema konten disepakati.",
  },
  {
    step: "02",
    title: "Desain UI/UX & Prototipe Visual",
    status: "completed",
    date: "16 Okt 2026",
    desc: "Penyusunan palet warna, tipografi, dan layout halaman utama disetujui klien.",
  },
  {
    step: "03",
    title: "Coding Frontend & Integrasi PocketBase",
    status: "active",
    progress: 75,
    date: "Sedang Dikerjakan",
    desc: "Pengembangan komponen interaktif, responsivitas layar, dan database dinamis.",
  },
  {
    step: "04",
    title: "Audit Kecepatan & On-Page SEO",
    status: "upcoming",
    date: "Estimasi 21 Okt",
    desc: "Pengujian PageSpeed, kompresi aset, penataan Schema JSON-LD, dan robots.txt.",
  },
  {
    step: "05",
    title: "Final Review & Deployment Go-Live",
    status: "upcoming",
    date: "Estimasi 23 Okt",
    desc: "Penghubungan domain kustom, konfigurasi SSL HTTPS, dan serah terima akses admin.",
  },
];

export default function LiveTrackingShowcase() {
  return (
    <section className="live-tracking-section" id="tracking-info">
      <div className="trimi-section-heading">
        <div>
          <span className="trimi-eyebrow">
            <Activity size={14} /> KEUNGGULAN EKSKLUSIF TRIMI
          </span>
          <h2>
            Bebas Rasa Khawatir.
            <br />
            <span>Pantau Progres Proyekmu Real-Time.</span>
          </h2>
        </div>
        <p>
          Tidak ada lagi cerita developer menghilang tanpa kabar. Di TriMi, setiap
          klien menerima akses link tracking rahasia untuk memantau status pengerjaan
          dari nol hingga website online.
        </p>
      </div>

      <div className="tracking-showcase-container">
        {/* Mockup Portal Tracking Interaktif */}
        <div className="tracking-mockup-window">
          <div className="mockup-header">
            <div className="mockup-dots">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <div className="mockup-url-bar">
              <Key size={12} className="url-lock" />
              <span>trimi.id/tracking/TRM-8829-X</span>
              <span className="url-badge">Private Token</span>
            </div>
            <div className="mockup-status-live">
              <span className="pulse-dot" /> LIVE TRACKING
            </div>
          </div>

          <div className="mockup-body">
            <div className="project-brief-strip">
              <div>
                <small>NAMA PROYEK</small>
                <strong>Kalea Living — E-Commerce & Web Bisnis</strong>
              </div>
              <div>
                <small>STATUS SAAT INI</small>
                <span className="status-pill active-pill">Tahap 03: Development (75%)</span>
              </div>
              <div>
                <small>ESTIMASI LIVE</small>
                <strong>23 Oktober 2026</strong>
              </div>
            </div>

            {/* Timeline */}
            <div className="mockup-timeline">
              {trackingMilestones.map((m, idx) => (
                <div key={idx} className={`timeline-node ${m.status}`}>
                  <div className="node-indicator">
                    {m.status === "completed" ? (
                      <CheckCircle2 size={16} />
                    ) : m.status === "active" ? (
                      <span className="active-spinner" />
                    ) : (
                      <span className="upcoming-dot">{m.step}</span>
                    )}
                  </div>

                  <div className="node-info">
                    <div className="node-head">
                      <h4>{m.title}</h4>
                      <span className="node-date">{m.date}</span>
                    </div>
                    <p>{m.desc}</p>
                    {m.status === "active" && (
                      <div className="active-progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Value Pillars */}
        <div className="tracking-value-cards">
          <div className="value-card">
            <div className="value-icon">
              <Clock size={20} />
            </div>
            <h4>Tepat Waktu & Terukur</h4>
            <p>
              Setiap tahapan memiliki batas waktu yang jelas, menjaga proyek selesai
              sesuai jadwal yang disepakati bersama.
            </p>
          </div>

          <div className="value-card">
            <div className="value-icon">
              <Eye size={20} />
            </div>
            <h4>Transparansi Total</h4>
            <p>
              Anda mengetahui persis apa yang sedang kami kerjakan setiap hari tanpa
              perlu terus-menerus menanyakan update.
            </p>
          </div>

          <div className="value-card">
            <div className="value-icon">
              <ShieldCheck size={20} />
            </div>
            <h4>Garansi Kepuasan</h4>
            <p>
              Setiap milestone memerlukan approval dari Anda sebelum melangkah ke
              tahap berikutnya, memastikan hasil sesuai ekspektasi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
