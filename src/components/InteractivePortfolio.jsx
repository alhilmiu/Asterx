import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Eye,
  Sparkles,
  Layers,
  ArrowUpRight,
  Globe,
  CheckCircle2,
  X,
  ChevronRight,
  Zap,
} from "lucide-react";
import { pb } from "../lib/pocketbase";
import "./InteractivePortfolio.css";

// Sample flagship projects jika data di PocketBase belum ada / masih sedikit
const fallbackPortfolios = [
  {
    id: "demo-1",
    title: "Kalea Living — E-Commerce Furniture & Interior",
    slug: "kalea-living",
    category: "E-Commerce",
    description:
      "Website e-commerce modern dengan katalog produk berkinerja tinggi, visual 3D interaktif, dan integrasi checkout WhatsApp otomatis.",
    website_url: "https://example.com/kalea",
    demo_url: "https://demo.example.com/kalea",
    tech_stack: ["React 19", "PocketBase", "Three.js", "Tailwind CSS"],
    metrics: "⚡ 0.7s Load Time • +55% Konversi",
    featured: true,
  },
  {
    id: "demo-2",
    title: "Endymata Studio — Profile & Digital Booking",
    slug: "endymata-studio",
    category: "Website Bisnis",
    description:
      "Company profile interaktif dengan sistem penjadwalan terpadu, portofolio multimedia, dan manajemen konten CMS mandiri.",
    website_url: "https://example.com/endymata",
    demo_url: "https://demo.example.com/endymata",
    tech_stack: ["React", "PocketBase", "Framer Motion", "SEO Ready"],
    metrics: "📈 100/100 SEO • Realtime Booking",
    featured: false,
  },
  {
    id: "demo-3",
    title: "Apex Logistics — B2B Tracking & Client Portal",
    slug: "apex-logistics",
    category: "Web Application",
    description:
      "Sistem portal klien real-time untuk pemantauan pengiriman logistik kontainer lintas kota dengan dasbor admin dan notifikasi otomatis.",
    website_url: "https://example.com/apex",
    demo_url: "https://demo.example.com/apex",
    tech_stack: ["React Router v7", "SQLite", "PocketBase API", "REST"],
    metrics: "🔒 Enkripsi Data • Realtime Tracking",
    featured: false,
  },
  {
    id: "demo-4",
    title: "Nara Coffee Roasters — High-Converting Landing Page",
    slug: "nara-coffee",
    category: "Landing Page",
    description:
      "Landing page promosi varian biji kopi pilihan dengan mikro animasi memikat, tata letak editorial, dan funnel order langsung ke WhatsApp bisnis.",
    website_url: "https://example.com/nara",
    demo_url: "https://demo.example.com/nara",
    tech_stack: ["React", "Vite", "Framer Motion", "Mobile First"],
    metrics: "🚀 Skor Performa 99 • Fast Checkout",
    featured: false,
  },
];

export default function InteractivePortfolio({
  portfolios = [],
  loading = false,
}) {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [activeModalProject, setActiveModalProject] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);

  // Gabungkan data PocketBase jika ada, fallback jika kosong
  const displayItems = useMemo(() => {
    if (portfolios && portfolios.length > 0) {
      return portfolios.map((p, idx) => ({
        ...p,
        featured: idx === 0,
        tech_stack: p.tech_stack
          ? Array.isArray(p.tech_stack)
            ? p.tech_stack
            : p.tech_stack.split(",")
          : ["React 19", "PocketBase", "Fast UI", "Responsive"],
        metrics: p.metrics || "⚡ Core Web Vitals Ready",
      }));
    }
    return fallbackPortfolios;
  }, [portfolios]);

  // List kategori unik
  const categories = useMemo(() => {
    const set = new Set(displayItems.map((item) => item.category).filter(Boolean));
    return ["Semua", ...Array.from(set)];
  }, [displayItems]);

  // Filter berdasarkan kategori
  const filteredItems = useMemo(() => {
    if (selectedCategory === "Semua") return displayItems;
    return displayItems.filter((item) => item.category === selectedCategory);
  }, [selectedCategory, displayItems]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  const getImageUrl = (item) => {
    if (!item.cover_image) return null;
    return pb.files.getURL(item, item.cover_image);
  };

  return (
    <section className="interactive-portfolio-section" id="portfolio">
      <div className="trimi-section-heading">
        <div>
          <span className="trimi-eyebrow">
            <Sparkles size={14} /> CRAFTED WITH PURPOSE & PRECISION
          </span>
          <h2>
            Ide yang Menjadi Nyata.
            <br />
            <span>Karya Pilihan Kami.</span>
          </h2>
        </div>
        <p>
          Setiap website dirancang unik, mengutamakan kecepatan akses, estetika
          berkelas, dan kemampuan konversi bisnis yang terukur.
        </p>
      </div>

      {/* Filter Kategori Modern Pill Bar */}
      <div className="portfolio-filter-bar">
        {categories.map((category) => {
          const count =
            category === "Semua"
              ? displayItems.length
              : displayItems.filter((i) => i.category === category).length;
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              className={`filter-pill-btn ${isActive ? "active" : ""}`}
              onClick={() => {
                setSelectedCategory(category);
                setVisibleCount(6);
              }}
            >
              <span>{category}</span>
              <span className="filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grid Portofolio */}
      {loading ? (
        <div className="portfolio-loading-state">
          <div className="loading-spinner" />
          <p>Memuat portofolio studio...</p>
        </div>
      ) : (
        <div className="portfolio-showcase-grid">
          {visibleItems.map((project, idx) => {
            const imageUrl = getImageUrl(project);

            return (
              <motion.article
                key={project.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="portfolio-card"
              >
                {/* Safari Browser Frame */}
                <div
                  className="browser-frame"
                  onClick={() => setActiveModalProject(project)}
                >
                  <div className="browser-header">
                    <div className="browser-dots">
                      <span className="dot dot-close" />
                      <span className="dot dot-min" />
                      <span className="dot dot-max" />
                    </div>
                    <div className="browser-url-bar">
                      <Globe size={11} className="url-globe-icon" />
                      <span className="url-text">
                        {project.slug
                          ? `${project.slug}.trimi.id`
                          : "project.trimi.id"}
                      </span>
                    </div>
                    <span className="browser-live-badge">Live Preview</span>
                  </div>

                  <div className="browser-viewport">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={project.title}
                        className="browser-viewport-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="browser-placeholder-screen">
                        <div className="placeholder-pattern" />
                        <div className="placeholder-brand-mark">
                          <Layers size={28} />
                          <strong>{project.title}</strong>
                          <small>{project.category}</small>
                        </div>
                      </div>
                    )}

                    {/* Overlay Action on Hover */}
                    <div className="browser-hover-overlay">
                      <button
                        type="button"
                        className="quick-view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalProject(project);
                        }}
                      >
                        <Eye size={15} />
                        <span>Lihat Studi Kasus</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Content & Details */}
                <div className="portfolio-card-info">
                  <div className="card-top-meta">
                    <span className="category-tag">{project.category}</span>
                    <span className="metric-pill">
                      <Zap size={11} /> {project.metrics}
                    </span>
                  </div>

                  <h3
                    className="card-title"
                    onClick={() => setActiveModalProject(project)}
                  >
                    {project.title}
                  </h3>
                  <p className="card-description">{project.description}</p>

                  {/* Tech Stack Tags */}
                  <div className="tech-stack-row">
                    {project.tech_stack.slice(0, 4).map((tech, tIdx) => (
                      <span key={tIdx} className="tech-tag">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Action Links */}
                  <div className="card-action-links">
                    <button
                      type="button"
                      className="case-study-link-btn"
                      onClick={() => setActiveModalProject(project)}
                    >
                      <span>Detail Proyek</span>
                      <ChevronRight size={14} />
                    </button>

                    <div className="external-links">
                      {project.website_url && (
                        <a
                          href={project.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="visit-site-link"
                          title="Buka Website Asli"
                        >
                          <span>Kunjungi</span>
                          <ArrowUpRight size={14} />
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="demo-site-link"
                          title="Buka Live Demo"
                        >
                          Demo ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Tombol Load More untuk Skalabilitas Portofolio */}
      {hasMore && (
        <div className="portfolio-load-more-wrap">
          <button
            type="button"
            className="portfolio-load-more-btn"
            onClick={handleLoadMore}
          >
            <span>Tampilkan Lebih Banyak Proyek</span>
            <span className="load-more-badge">
              +{filteredItems.length - visibleCount}
            </span>
          </button>
        </div>
      )}

      {/* Modal Quick View Case Study */}
      <AnimatePresence>
        {activeModalProject && (
          <div
            className="portfolio-modal-backdrop"
            onClick={() => setActiveModalProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 30 }}
              transition={{ duration: 0.25 }}
              className="portfolio-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <span className="modal-category">
                    {activeModalProject.category}
                  </span>
                  <h2>{activeModalProject.title}</h2>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setActiveModalProject(null)}
                  aria-label="Tutup modal"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                {/* Media Screen */}
                <div className="modal-screen-wrapper">
                  {getImageUrl(activeModalProject) ? (
                    <img
                      src={getImageUrl(activeModalProject)}
                      alt={activeModalProject.title}
                      className="modal-screen-img"
                    />
                  ) : (
                    <div className="modal-screen-placeholder">
                      <Layers size={36} />
                      <p>Pratinjau Antarmuka Proyek</p>
                    </div>
                  )}
                </div>

                {/* Deskripsi & Ringkasan Solusi */}
                <div className="modal-details-grid">
                  <div className="modal-main-desc">
                    <h4>Ringkasan Solusi</h4>
                    <p>{activeModalProject.description}</p>

                    <h4>Spesifikasi Rekayasa</h4>
                    <ul className="modal-features-list">
                      <li>
                        <CheckCircle2 size={15} /> 100% Responsif di Smartphone, Tablet, & Laptop
                      </li>
                      <li>
                        <CheckCircle2 size={15} /> Integrasi Backend & Database PocketBase Terenkripsi
                      </li>
                      <li>
                        <CheckCircle2 size={15} /> Optimasi Kecepatan Web & On-Page SEO Siap Google
                      </li>
                      <li>
                        <CheckCircle2 size={15} /> Navigasi Bersih & Pengalaman Pengguna (UX) Ergonomis
                      </li>
                    </ul>
                  </div>

                  <div className="modal-side-meta">
                    <div className="meta-block">
                      <span className="meta-label">TEKNOLOGI DIGUNAKAN</span>
                      <div className="modal-tech-list">
                        {activeModalProject.tech_stack.map((t, idx) => (
                          <span key={idx} className="tech-badge">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="meta-block">
                      <span className="meta-label">METRIK & PERFORMA</span>
                      <strong className="meta-val">
                        {activeModalProject.metrics}
                      </strong>
                    </div>

                    <div className="modal-cta-buttons">
                      {activeModalProject.website_url && (
                        <a
                          href={activeModalProject.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="trimi-button-primary modal-action-btn"
                        >
                          <span>Kunjungi Website Asli</span>
                          <ExternalLink size={15} />
                        </a>
                      )}
                      {activeModalProject.demo_url && (
                        <a
                          href={activeModalProject.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="trimi-button-secondary modal-action-btn"
                        >
                          <span>Buka Live Demo</span>
                          <ArrowUpRight size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
