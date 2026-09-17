import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

function cx(...args: (string | boolean | undefined | null)[]) {
  return args.filter(Boolean).join(" ");
}

interface StoryScrollProps {
  className?: string;
  sections?: Array<{
    id: string;
    title: string;
    content: React.ReactNode;
    media?: React.ReactNode;
    mediaPosition?: "left" | "right";
    background?: string;
  }>;
}

export function StoryScroll({
  className,
  sections = [
    {
      id: "intro",
      title: "Dari catatan mentah ke pemahaman mendalam",
      content: (
        <div className="space-y-4">
          <p className="text-[var(--text-muted)] text-lg leading-relaxed">
            Kamu punya tumpukan diktat, jurnal, dan catatan kuliah. Ngampus AI bantu ubah jadi pemahaman yang terstruktur — bukan cuma rangkuman, tapi alur belajar lengkap.
          </p>
          <p className="text-[var(--text-muted)] text-lg leading-relaxed">
            Masukkan materi → dapatkan rangkuman per topik → tanya konsep yang bingung → parafrase untuk tugas → buat flashcard → uji dengan quiz. Semua dalam satu alur, satu akun.
          </p>
        </div>
      ),
      media: (
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-subtle)]">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
        </div>
      ),
      mediaPosition: "right",
    },
    {
      id: "chat",
      title: "Tanya AI — Chat streaming Gemini Flash",
      content: (
        <div className="space-y-4">
          <p className="text-[var(--text-muted)] text-lg leading-relaxed">
            Tanya konsep sulit, minta contoh soal, bedah jurnal — semua berbahasa Indonesia. Jawaban streaming real-time dengan riwayat chat tersimpan per akun.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {["Konsep", "Contoh Soal", "Bedah Jurnal", "Bahasa ID"].map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ),
      media: (
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-subtle)]">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        </div>
      ),
      mediaPosition: "left",
    },
    {
      id: "summarize",
      title: "Rangkumin — Diktat tebal jadi poin inti",
      content: (
        <div className="space-y-4">
          <p className="text-[var(--text-muted)] text-lg leading-relaxed">
            Upload PDF atau tempel teks panjang. Pilih gaya: bullet singkat, detail per topik, atau narasi. Output terstruktur dengan heading hierarkis, siap dicetak atau diekspor.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
              <div className="font-semibold text-[var(--accent)]">Input</div>
              <div className="text-[var(--text-muted)]">30 halaman PDF</div>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
              <div className="font-semibold text-[var(--accent)]">Output</div>
              <div className="text-[var(--text-muted)]">12 poin inti + 3 tabel</div>
            </div>
          </div>
        </div>
      ),
      media: (
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-subtle)]">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
        </div>
      ),
      mediaPosition: "right",
    },
    {
      id: "paraphrase",
      title: "Parafrase — Tulis ulang dengan diksi baru",
      content: (
        <div className="space-y-4">
          <p className="text-[var(--text-muted)] text-lg leading-relaxed">
            Tiga intensitas: ringan (perbaiki ejaan/grammar), sedang (ubah struktur kalimat), berat (tulis ulang total). Makna dijaga, hasilnya punya suara kamu sendiri.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {["Ringan", "Sedang", "Berat"].map((level, i) => (
              <div key={level} className="px-4 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
                <div className="font-semibold text-[var(--text)]">{level}</div>
                <div className="text-[var(--text-muted)] text-sm">Intensitas {i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      ),
      media: (
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-subtle)]">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
        </div>
      ),
      mediaPosition: "left",
    },
    {
      id: "citations",
      title: "Referensi — Sitasi APA, IEEE, Harvard, MLA otomatis",
      content: (
        <div className="space-y-4">
          <p className="text-[var(--text-muted)] text-lg leading-relaxed">
            Masukkan judul/DOI/URL → dapatkan sitasi rapi sesuai format yang dipilih. Tersimpan otomatis di akun, siap diekspor ke BibTeX atau copy-paste ke dokumen.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {["APA 7th", "IEEE", "Harvard", "MLA 9th"].map((style) => (
              <span key={style} className="px-3 py-1 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-muted)] text-sm">
                {style}
              </span>
            ))}
          </div>
        </div>
      ),
      media: (
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-subtle)]">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
        </div>
      ),
      mediaPosition: "right",
    },
    {
      id: "flashcards",
      title: "Kartu Belajar — Flashcard tanya-jawab otomatis",
      content: (
        <div className="space-y-4">
          <p className="text-[var(--text-muted)] text-lg leading-relaxed">
            Dari rangkuman atau materi mentah, generate flashcard Q/A. Balik kartu, hafalkan, lanjut. Algoritma spaced repetition bantu ingat lama.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="w-40 h-24 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] text-sm">
              Sisi A: Pertanyaan
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--accent)]">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
              <path d="M14 16V11a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
              <path d="M10 21V16a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
              <path d="M18 11h.01" />
              <path d="M14 16h.01" />
              <path d="M10 21h.01" />
              <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.83L7 15" />
            </svg>
            <div className="w-40 h-24 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)] flex items-center justify-center text-[var(--accent-text)] text-sm font-medium">
              Sisi B: Jawaban
            </div>
          </div>
        </div>
      ),
      media: (
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-subtle)]">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="6" y1="8" x2="18" y2="8" />
              <line x1="6" y1="12" x2="18" y2="12" />
              <line x1="6" y1="16" x2="12" y2="16" />
            </svg>
          </div>
        </div>
      ),
      mediaPosition: "left",
    },
    {
      id: "quiz",
      title: "Quiz — Uji pemahaman dari materimu sendiri",
      content: (
        <div className="space-y-4">
          <p className="text-[var(--text-muted)] text-lg leading-relaxed">
            Generate soal pilihan ganda/esai dari materi. Dapat skor instan + penjelasan tiap jawaban. Fokus belajar di bagian yang masih salah.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div className="p-4 rounded-xl bg-[var(--success-soft)] border border-[var(--success)]/30">
              <div className="font-bold text-2xl text-[var(--success)]">15</div>
              <div className="text-[var(--success)] text-sm">Soal per sesi</div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/30">
              <div className="font-bold text-2xl text-[var(--accent-text)]">100%</div>
              <div className="text-[var(--accent-text)] text-sm">Penjelasan jawaban</div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
              <div className="font-bold text-2xl text-[var(--text)]">∞</div>
              <div className="text-[var(--text-muted)] text-sm">Ulang tak terbatas</div>
            </div>
          </div>
        </div>
      ),
      media: (
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-subtle)]">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
        </div>
      ),
      mediaPosition: "right",
    },
  ],
}: StoryScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Array<HTMLDivElement | null>>([]);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      sections.forEach((_, index) => {
        const sectionEl = sectionRefs.current[index];
        if (!sectionEl) return;

        const contentEl = sectionEl.querySelector(".story-content");
        const mediaEl = sectionEl.querySelector(".story-media");

        if (contentEl) {
          gsap.from(contentEl, {
            scrollTrigger: {
              trigger: sectionEl,
              start: "top 75%",
              end: "bottom 50%",
              scrub: 1,
            },
            y: 80,
            opacity: 0,
            ease: "power3.out",
          });
        }

        if (mediaEl) {
          gsap.from(mediaEl, {
            scrollTrigger: {
              trigger: sectionEl,
              start: "top 75%",
              end: "bottom 50%",
              scrub: 1,
            },
            y: 100,
            opacity: 0,
            scale: 0.95,
            ease: "power3.out",
          });
        }

        gsap.to(sectionEl, {
          scrollTrigger: {
            trigger: sectionEl,
            start: "top bottom",
            end: "top top",
            scrub: 1,
          },
          backgroundColor: "var(--bg-subtle)",
          ease: "none",
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_60%)] opacity-5 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />

      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          ref={(el) => (sectionRefs.current[index] = el)}
          className="relative py-20 lg:py-32 px-5"
        >
          <div className="max-w-6xl mx-auto">
            <div
              className={cx(
                "grid lg:grid-cols-12 gap-12 lg:gap-16 items-center",
                section.mediaPosition === "left" ? "" : "lg:grid-flow-dense"
              )}
            >
              <div
                className={cx(
                  "story-content lg:col-span-6",
                  section.mediaPosition === "left" ? "lg:col-start-7" : "lg:col-start-1"
                )}
              >
                <span className="inline-block px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] text-[11px] font-semibold tracking-wider uppercase mb-4">
                  {index + 1} / {sections.length}
                </span>
                <h2 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-[var(--text)] mb-6">
                  {section.title}
                </h2>
                <div className="text-base sm:text-lg">{section.content}</div>
              </div>

              {section.media && (
                <div
                  className={cx(
                    "story-media lg:col-span-6 relative",
                    section.mediaPosition === "left" ? "lg:col-start-1" : "lg:col-start-7"
                  )}
                >
                  <div className="relative aspect-[4/3] sticky top-24">
                    {section.media}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {index < sections.length - 1 && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-16 bg-gradient-to-t from-[var(--bg)] to-transparent pointer-events-none" />
          )}
        </section>
      ))}

      <div className="relative py-20 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-[1.1] tracking-tight text-[var(--text)] mb-4">
            Siap belajar lebih efisien?
          </h2>
          <p className="text-[var(--text-muted)] text-lg mb-8">
            Gabung ribuan mahasiswa yang sudah pakai Ngampus AI. Gratis, tanpa kartu kredit.
          </p>
          <a
            href="/daftar"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--accent)] text-white font-semibold text-base hover:bg-[var(--accent-hover)] transition-colors shadow-lg shadow-[var(--accent)]/30"
          >
            Mulai gratis sekarang
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export default StoryScroll;