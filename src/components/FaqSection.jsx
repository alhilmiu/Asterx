import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";
import "./FaqSection.css";

const faqs = [
  {
    q: "Berapa lama waktu yang dibutuhkan untuk menyelesaikan website?",
    a: "Tergantung skala proyek. Untuk Landing Page siap dalam 3–5 hari kerja. Website Bisnis / Company Profile rata-rata selesai dalam 7–10 hari kerja. Sementara Web App Custom berkisar 14–21 hari. Jadwal pengerjaan dapat Anda pantau setiap hari melalui portal live tracking kami.",
  },
  {
    q: "Apakah saya bisa mengubah konten, teks, atau gambar sendiri nantinya?",
    a: "Tentu saja! Kami mengintegrasikan CMS Panel Admin (PocketBase) yang sangat mudah digunakan bahkan untuk pemula. Anda bisa menambah artikel, mengubah harga, memperbarui foto, dan mengelola portofolio tanpa perlu keahlian koding.",
  },
  {
    q: "Apakah biaya pembuatan sudah termasuk domain dan hosting?",
    a: "Ya! Seluruh paket yang kami tawarkan sudah termasuk gratis nama domain (.com) dan cloud hosting berkecepatan tinggi selama 1 tahun pertama. Anda tidak perlu repot setup server teknis secara mandiri.",
  },
  {
    q: "Bagaimana alur dan sistem pembayarannya?",
    a: "Sistem pembayaran terbagi menjadi 2 termin yang adil: Uang muka (DP) 50% di awal saat perjanjian dan brief disepakati, lalu sisa 50% dilunasi setelah website selesai dibangun, ditinjau, dan disetujui untuk go-live.",
  },
  {
    q: "Apakah ada garansi jika terjadi error atau bug setelah website rilis?",
    a: "Pasti. Kami memberikan garansi perbaikan bug dan pendampingan teknis gratis selama 30 hari setelah peluncuran. Kami memastikan website Anda beroperasi secara stabil dan aman.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="trimi-faq-section" id="faq">
      <div className="trimi-section-heading">
        <div>
          <span className="trimi-eyebrow">
            <HelpCircle size={14} /> FREQUENTLY ASKED QUESTIONS
          </span>
          <h2>
            Pertanyaan yang
            <br />
            <span>Sering Diajukan.</span>
          </h2>
        </div>
        <p>
          Temukan jawaban cepat atas pertanyaan seputar alur kerja, teknologi,
          hingga ketentuan garansi layanan TriMi.
        </p>
      </div>

      <div className="faq-accordion-container">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`faq-accordion-item ${isOpen ? "open" : ""}`}
            >
              <button
                className="faq-question-btn"
                onClick={() => toggleFaq(idx)}
                aria-expanded={isOpen}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`faq-chevron ${isOpen ? "rotated" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="faq-answer-wrapper"
                  >
                    <div className="faq-answer-text">
                      <p>{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
