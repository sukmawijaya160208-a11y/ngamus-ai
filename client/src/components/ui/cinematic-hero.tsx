import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface CinematicHeroProps {
  className?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
}

export function CinematicHero({
  className,
  title = "Belajar kuliah jadi lebih cepat.",
  subtitle = "Ngampus AI",
  description = "Rangkum materi, jawab pertanyaan, parafrase tugas, susun flashcard — langsung di browser, tanpa antre.",
  primaryAction = { label: "Daftar gratis", href: "/daftar" },
  secondaryAction = { label: "Lihat cara kerja", href: "#fitur" },
  stats = [
    { label: "Tool belajar", value: "6" },
    { label: "Request gratis/hari", value: "1.500" },
    { label: "Role", value: "2" },
    { label: "Harga dasar", value: "Rp0" },
  ],
}: CinematicHeroProps) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLSpanElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const primaryBtnRef = useRef<HTMLAnchorElement>(null);
  const secondaryBtnRef = useRef<HTMLAnchorElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out", duration: 1 },
      });

      tl.from(titleRef.current, { y: 60, opacity: 0 })
        .from(subtitleRef.current, { y: 30, opacity: 0 }, "-=0.6")
        .from(descriptionRef.current, { y: 30, opacity: 0 }, "-=0.4")
        .from(primaryBtnRef.current, { y: 30, opacity: 0 }, "-=0.3")
        .from(secondaryBtnRef.current, { y: 30, opacity: 0 }, "-=0.2")
        .from(statsRef.current?.children, { y: 40, opacity: 0, stagger: 0.1 }, "-=0.3")
        .from(scrollIndicatorRef.current, { opacity: 0 }, "-=0.2");

      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          if (heroRef.current) {
            heroRef.current.style.setProperty("--scroll-progress", progress.toString());
          }
        },
      });

      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className={cn(
        "relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--bg)]",
        className
      )}
      style={{ "--scroll-progress": "0" } as React.CSSProperties}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--accent)_0%,_transparent_70%)] opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-5 py-20">
        <div className="text-center">
          <span
            ref={subtitleRef}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] text-[12px] font-semibold tracking-wide uppercase mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" /> {subtitle}
          </span>

          <h1 ref={titleRef} className="font-display font-semibold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] tracking-tight text-[var(--text)] mb-6">
            {title.split(" ").map((word, i) => (
              <span key={i} className="inline-block">
                {word} {" "}
              </span>
            ))}
            <span className="relative inline-block">
              <span className="relative z-10">cepat.</span>
              <span
                className="absolute bottom-2 left-0 right-0 h-6 bg-[var(--accent-soft)] opacity-50 -z-10"
                aria-hidden="true"
              />
            </span>
          </h1>

          <p ref={descriptionRef} className="text-[var(--text-muted)] text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              ref={primaryBtnRef}
              href={primaryAction.href}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--accent)] text-white font-semibold text-base hover:bg-[var(--accent-hover)] transition-colors shadow-lg shadow-[var(--accent)]/30"
            >
              {primaryAction.label}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              ref={secondaryBtnRef}
              href={secondaryAction.href}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-[var(--border-strong)] text-[var(--text)] font-semibold text-base hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              {secondaryAction.label}
            </a>
          </div>

          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-colors">
                <div className="font-mono font-bold text-3xl sm:text-4xl text-[var(--accent)]">{stat.value}</div>
                <div className="text-[var(--text-muted)] text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
          aria-hidden="true"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-subtle)]">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}

export default CinematicHero;