"use client";

import { ReactNode, useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import Cursor from "./Cursor";
import Navbar from "./Navbar";
import GrainOverlay from "./GrainOverlay";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  children: ReactNode;
};

export default function AppShell({ children }: Props) {
  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const lenis = new Lenis({
      duration: 1.4,
      lerp: 0.08,
      smoothWheel: true,
      easing: (t: number) => 1 - Math.pow(2, -10 * t),
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);

    gsap.ticker.lagSmoothing(0);

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href) return;
      const element = document.querySelector(href);
      if (!element) return;
      event.preventDefault();
      lenis.scrollTo(element as HTMLElement, { duration: 1.4 });
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ color: "var(--ink)" }}>
      <GrainOverlay />
      <Cursor />
      <Navbar />
      <motion.main
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.2,
            },
          },
        }}
        className="relative z-10"
      >
        {children}
      </motion.main>
    </div>
  );
}
