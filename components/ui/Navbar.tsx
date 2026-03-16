"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const links = [
  { href: "#home",     label: "Home" },
  { href: "#music",    label: "Music" },
  { href: "#videos",   label: "Videos" },
  { href: "#bouquet",  label: "Bouquet" },
  { href: "#story",    label: "Our Story" },
  { href: "#memories", label: "Memories" },
];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [active,   setActive]     = useState("home");
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = links
      .map((l) => document.querySelector(l.href))
      .filter(Boolean) as Element[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0.01 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const navItems = useMemo(
    () =>
      links.map((link) => {
        const isActive = active === link.href.replace("#", "");
        return (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className="relative py-1 transition-colors duration-200"
            style={{
              fontFamily: "var(--font-garamond), Georgia, serif",
              fontSize: "15px",
              color: isActive ? "var(--ink)" : "var(--muted)",
            }}
          >
            {link.label}
            {isActive && (
              <motion.span
                layoutId="nav-underline"
                className="absolute inset-x-0 -bottom-0.5 h-px"
                style={{ background: "var(--ink)" }}
              />
            )}
          </a>
        );
      }),
    [active],
  );

  return (
    <>
      {/* Pill nav — hidden at top, slides in on scroll */}
      <div
        className={`fixed left-1/2 top-5 z-50 -translate-x-1/2 transition-all duration-500 ${
          scrolled
            ? "pointer-events-auto opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 -translate-y-3"
        }`}
      >
        <nav
          className="flex items-center gap-6 rounded-full px-5 py-2.5"
          style={{
            background: "rgba(245,240,232,0.92)",
            border: "1px solid rgba(0,0,0,0.08)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: "0 4px 28px rgba(0,0,0,0.06)",
          }}
        >
          {/* Logo — italic garamond */}
          <a
            href="#home"
            style={{
              fontFamily: "var(--font-garamond), Georgia, serif",
              fontStyle: "italic",
              fontSize: "16px",
              color: "var(--ink)",
            }}
          >
            her birthday
          </a>

          <div className="hidden items-center gap-6 md:flex">{navItems}</div>

          {/* CTA pill */}
          <a
            href="#music"
            className="hidden md:block rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-80"
            style={{
              background: "var(--ink)",
              fontFamily: "var(--font-garamond), Georgia, serif",
            }}
          >
            Celebrate
          </a>

          <button
            aria-label="Menu"
            className="rounded-full p-1.5 md:hidden"
            style={{ border: "1px solid rgba(0,0,0,0.1)", color: "var(--ink)" }}
            onClick={() => setMenuOpen((s) => !s)}
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </nav>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center md:hidden"
            style={{
              background: "rgba(245,240,232,0.95)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="flex w-[78%] max-w-xs flex-col items-center gap-7 p-10 text-center"
              style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 8px 48px rgba(0,0,0,0.08)",
              }}
            >
              {navItems}
              <a
                href="#music"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-full px-6 py-2.5 text-xs uppercase tracking-[0.14em] text-white"
                style={{
                  background: "var(--ink)",
                  fontFamily: "var(--font-garamond), Georgia, serif",
                }}
              >
                Celebrate
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}