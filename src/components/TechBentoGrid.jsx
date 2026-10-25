import { motion } from "framer-motion";
import {
  Gauge,
  Layers,
  Database,
  Search,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from "lucide-react";
import "./TechBentoGrid.css";

export default function TechBentoGrid() {
  return (
    <section className="trimi-bento-section" id="keunggulan">
      <div className="trimi-section-heading">
        <div>
          <span className="trimi-eyebrow">
            <Zap size={14} /> THE ENGINEERING STANDARD
          </span>
          <h2>
            Bukan Sekadar Tampilan.
            <br />
            <span>Dibangun dengan Kualitas Tertinggi.</span>
          </h2>
        </div>
        <p>
          Kami memadukan estetika modern dengan standar rekayasa web terkini
          agar website Anda cepat, aman, dan menghasilkan konversi nyata.
        </p>
      </div>

      <div className="bento-grid">
        {/* Bento 1: High Performance & Speed (Large) */}
        <motion.div
          className="bento-card bento-perf"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bento-icon-pill">
            <Gauge size={18} /> Performa & Kecepatan
          </div>
          <h3>Kecepatan Kilat & Skor PageSpeed Sempurna</h3>
          <p>
            Dibangun dengan <strong>React 19 & Vite</strong>, memangkas ukuran
            bundle dan overhead eksekusi. Loading dalam hitungan milidetik bahkan
            pada koneksi 4G seluler.
          </p>

          <div className="speed-metrics-badge">
            <div className="metric-circle">
              <span className="metric-score">99</span>
              <span className="metric-name">Performance</span>
            </div>
            <div className="metric-circle">
              <span className="metric-score">100</span>
              <span className="metric-name">Accessibility</span>
            </div>
            <div className="metric-circle">
              <span className="metric-score">100</span>
              <span className="metric-name">Best Practice</span>
            </div>
            <div className="metric-circle">
              <span className="metric-score">100</span>
              <span className="metric-name">SEO Ready</span>
            </div>
          </div>
        </motion.div>

        {/* Bento 2: 3D & Creative Interaction */}
        <motion.div
          className="bento-card bento-3d"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bento-icon-pill">
            <Layers size={18} /> Visual Interaktif
          </div>
          <h3>Interaksi 3D & Animasi Fluid</h3>
          <p>
            Ditenagai <strong>Three.js</strong> dan <strong>Framer Motion</strong>.
            Memberikan identitas visual dinamis yang membedakan bisnis Anda dari
            kompetitor ber-template biasa.
          </p>
          <div className="bento-tag-list">
            <span>React Three Fiber</span>
            <span>Micro-interactions</span>
            <span>GPU Accelerated</span>
          </div>
        </motion.div>

        {/* Bento 3: Backend & Database PocketBase */}
        <motion.div
          className="bento-card bento-database"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bento-icon-pill">
            <Database size={18} /> Database Cepat & Hemat
          </div>
          <h3>Arsitektur Data Modern PocketBase</h3>
          <p>
            Database SQLite embedded dengan kecepatan tinggi, sistem autentikasi
            keamanan berlapis, dan real-time event tanpa langganan server yang boros.
          </p>
          <div className="bento-feature-checks">
            <div>
              <CheckCircle2 size={13} /> Panel Admin Khusus
            </div>
            <div>
              <CheckCircle2 size={13} /> Enkripsi Data
            </div>
            <div>
              <CheckCircle2 size={13} /> REST & Real-time API
            </div>
          </div>
        </motion.div>

        {/* Bento 4: SEO On-Page Native */}
        <motion.div
          className="bento-card bento-seo"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bento-icon-pill">
            <Search size={18} /> Algoritma Google
          </div>
          <h3>Fondasi SEO Siap Juara</h3>
          <p>
            Struktur semantik HTML5, Open Graph media sosial, serta Schema Markup
            JSON-LD agar web langsung dikenali dan diutamakan Google.
          </p>
        </motion.div>

        {/* Bento 5: 100% Adaptive Responsive */}
        <motion.div
          className="bento-card bento-mobile"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bento-icon-pill">
            <Smartphone size={18} /> Multi-Device
          </div>
          <h3>Responsif Sempurna di Semua Layar</h3>
          <p>
            Tampilan presisi dan nyaman dinikmati di layar smartphone, tablet,
            laptop kerja, hingga monitor ultra-wide.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
