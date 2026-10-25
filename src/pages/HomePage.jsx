import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { pb } from "../lib/pocketbase";
import RobotHero from "../components/RobotHero";
import TechBentoGrid from "../components/TechBentoGrid";
import LiveTrackingShowcase from "../components/LiveTrackingShowcase";
import CostEstimator from "../components/CostEstimator";
import FaqSection from "../components/FaqSection";
import InteractivePortfolio from "../components/InteractivePortfolio";
import {
  MessageCircle,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import "./HomePageEnhancement.css";

const services = [
  {
    number: "01",
    title: "Website Bisnis & Profil",
    description:
      "Website profesional untuk memperkenalkan bisnis, membangun kredibilitas, dan menjangkau lebih banyak pelanggan.",
  },
  {
    number: "02",
    title: "Landing Page Berkonversi",
    description:
      "Halaman promosi yang dirancang khusus untuk memikat calon pembeli dan mendorong aksi konversi secara maksimal.",
  },
  {
    number: "03",
    title: "Custom Web Application",
    description:
      "Solusi website interaktif yang disesuaikan dengan alur kerja, logika bisnis, dan database PocketBase mandiri.",
  },
  {
    number: "04",
    title: "Undangan & Media Digital",
    description:
      "Undangan digital personal dan interaktif untuk merayakan momen spesial dengan elegan, praktis, dan modern.",
  },
];

export default function HomePage() {
  const [portfolios, setPortfolios] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  useEffect(() => {
    let active = true;

    async function loadPortfolios() {
      try {
        const records = await pb.collection("portfolios").getFullList({
          filter: "is_published = true",
          sort: "sort_order,title",
          requestKey: null,
        });

        if (active) {
          setPortfolios(records);
        }
      } catch (error) {
        console.error("Portfolio gagal dimuat:", error);
      } finally {
        if (active) {
          setPortfolioLoading(false);
        }
      }
    }

    loadPortfolios();

    return () => {
      active = false;
    };
  }, []);

  // Nomor WhatsApp tujuan, format internasional tanpa tanda +.
  const whatsappNumber = "6281234567890";

  const whatsappMessage = encodeURIComponent(
    "Halo AsterX Tech! Saya tertarik untuk konsultasi mengenai pembuatan website profesional untuk bisnis saya."
  );

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
    : "#kontak";

  const categories = [
    "Semua",
    ...new Set(portfolios.map((p) => p.category).filter(Boolean)),
  ];

  const filteredPortfolios =
    selectedCategory === "Semua"
      ? portfolios
      : portfolios.filter((p) => p.category === selectedCategory);

  return (
    <main className="trimi-home">
      {/* Header Navigasi */}
      <header className="trimi-header">
        <Link to="/" className="trimi-brand">
          <span className="trimi-brand-mark">A</span>
          <span className="trimi-brand-name">
            <strong>ASTERX TECH</strong>
            <small>DIGITAL SOLUTIONS</small>
          </span>
        </Link>

        <nav className="trimi-nav">
          <a href="#layanan">Layanan</a>
          <Link
            to="/invitations"
            style={{ color: "#a5b4fc", fontWeight: 600 }}
          >
            Undangan Digital
          </Link>
          <a href="#keunggulan">Keunggulan</a>
          <a href="#portfolio">Portfolio</a>
          <a href="#kalkulator">Estimasi Biaya</a>
          <a href="#tracking-info">Live Tracking</a>
          <a href="#faq">FAQ</a>
          <a href="#tentang">Tentang</a>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="trimi-availability-pill">
            <span className="pulse-dot-green" /> Slot Terbuka
          </div>

          <Link to="/login" className="trimi-admin-link">
            Admin <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      {/* Hero 3D Interaktif */}
      <RobotHero whatsappUrl={whatsappUrl} />

      {/* Layanan */}
      <section className="trimi-services" id="layanan">
        <div className="trimi-section-heading">
          <div>
            <span className="trimi-eyebrow">WHAT WE CAN CREATE</span>
            <h2>
              Kebutuhan berbeda.
              <br />
              <span>Solusi yang tepat.</span>
            </h2>
          </div>

          <p>
            Setiap ide punya kebutuhan uniknya sendiri. Kami merancang dan
            membangun solusi digital yang paling efektif untuk bisnis Anda.
          </p>
        </div>

        <div className="trimi-service-grid">
          {services.map((service) => (
            <article className="trimi-service-card" key={service.number}>
              <span className="trimi-service-number">{service.number}</span>

              <div className="trimi-service-symbol" aria-hidden="true">
                {service.number === "01"
                  ? "↗"
                  : service.number === "02"
                    ? "◫"
                    : service.number === "03"
                      ? "⌘"
                      : "✳"}
              </div>

              <h3>{service.title}</h3>
              <p>{service.description}</p>

              {service.number === "04" ? (
                <Link
                  to="/invitations"
                  className="trimi-service-link"
                  style={{ color: "#a5b4fc" }}
                >
                  Lihat Katalog Undangan <span aria-hidden="true">↗</span>
                </Link>
              ) : (
                <a href={whatsappUrl} className="trimi-service-link">
                  Konsultasikan <span aria-hidden="true">↗</span>
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Keunggulan */}
      <TechBentoGrid />

      {/* Portfolio */}
      <InteractivePortfolio
        portfolios={portfolios}
        loading={portfolioLoading}
      />

      {/* Live Order Tracking */}
      <LiveTrackingShowcase />

      {/* Kalkulator Estimasi */}
      <CostEstimator whatsappNumber={whatsappNumber} />

      {/* Tentang ASTERX TECH */}
      <section className="trimi-about" id="tentang">
        <span className="trimi-eyebrow">THE ASTERX TECH APPROACH</span>

        <h2>
          Technology
          <br />
          <span>built for you.</span>
        </h2>

        <p>
          ASTERX TECH percaya bahwa website yang berhasil berawal dari memahami
          tujuan dan karakter bisnis Anda. Kami menyimak kebutuhan Anda,
          merumuskan arsitektur yang solid, lalu membangunnya dengan presisi
          tinggi.
        </p>

        <div className="trimi-process">
          <div>
            <span>01</span>
            <strong>Dengarkan & Analisis</strong>
            <p>
              Memahami target audiens, tujuan komersial, dan kebutuhan sistem
              Anda.
            </p>
          </div>

          <div>
            <span>02</span>
            <strong>Rancang & Prototipe</strong>
            <p>
              Menyusun desain antarmuka, arsitektur visual, dan wireframe
              interaktif.
            </p>
          </div>

          <div>
            <span>03</span>
            <strong>Wujudkan & Optimasi</strong>
            <p>
              Mengembangkan kode bersih, pengujian multi-layar, dan audit SEO
              hingga online.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection />

      {/* Kontak */}
      <section className="trimi-contact-section" id="kontak">
        <div className="trimi-contact-card">
          <span className="trimi-eyebrow">YOUR IDEA STARTS HERE</span>

          <h2>
            Punya rencana proyek?
            <br />
            <span>Mari kita diskusikan.</span>
          </h2>

          <p>
            Konsultasikan kebutuhan website Anda secara santai dan gratis. Kami
            siap membantu menentukan solusi terbaik untuk bisnis Anda.
          </p>

          <div className="trimi-contact-actions">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="trimi-button-primary contact-cta-btn"
            >
              <MessageCircle size={17} />
              <span>Chat Langsung via WhatsApp</span>
              <ArrowUpRight size={17} />
            </a>
          </div>

          <div className="trimi-contact-info-strip">
            <div>
              <Clock size={14} /> Respon Cepat (Senin - Sabtu, 08.00 - 20.00 WIB)
            </div>
            <div>
              <ShieldCheck size={14} /> Garansi 30 Hari & Bebas Bug
            </div>
            <div>
              <Sparkles size={14} /> Konsultasi & Estimasi 100% Gratis
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="trimi-footer">
        <Link to="/" className="trimi-brand">
          <span className="trimi-brand-mark">A</span>
          <span className="trimi-brand-name">
            <strong>ASTERX TECH</strong>
            <small>DIGITAL SOLUTIONS</small>
          </span>
        </Link>

        <p>
          Solusi website berkinerja tinggi yang dirancang dengan presisi dan
          tujuan.
        </p>

        <span>
          © {new Date().getFullYear()} ASTERX TECH. All rights reserved.
        </span>
      </footer>
    </main>
  );
}
