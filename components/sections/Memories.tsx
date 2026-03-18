"use client";

import GlassCard from "@/components/ui/GlassCard";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const photos = [
  "/photos/20250510_185637.jpg",
  "/photos/20250209_172413.jpg",
  "/photos/20251206_194155.jpg",
  "/photos/IMG-20251208-WA0024.jpg",
  "/photos/20260215_194559.jpg",
  "/photos/20250209_154910.jpg",
  "/photos/20250207_182911 (2).jpg",
  "/photos/20250708_131356.jpg",
  "/photos/20250708_131533.jpg",
  "/photos/IMG-20230625-WA0014.jpg",
  "/photos/IMG-20250114-WA0011.jpg",
  "/photos/IMG-20250316-WA0005.jpg",
  "/photos/IMG-20250705-WA0105.jpg",
  "/photos/IMG-20250907-WA0000.jpg",
  "/photos/IMG-20250912-WA0000.jpg",
  "/photos/IMG-20250912-WA0002.jpg",
  "/photos/IMG-20250913-WA0000.jpg",
  "/photos/IMG-20250917-WA0038.jpg",
  "/photos/IMG-20250918-WA0276.jpg",
  "/photos/IMG-20251109-WA0068.jpg",
  "/photos/IMG-20251114-WA0006.jpg",
  "/photos/IMG-20251114-WA0007.jpg",
  "/photos/IMG-20251114-WA0011.jpg",
  "/photos/IMG-20251114-WA0021.jpg",
  "/photos/IMG-20251116-WA0003.jpg",
  "/photos/IMG-20251128-WA0002.jpg",
  "/photos/IMG-20251128-WA0005.jpg",
  "/photos/IMG-20251208-WA0021.jpg",
  "/photos/IMG-20251208-WA0042.jpg",
  "/photos/IMG-20251212-WA0014.jpg",
  "/photos/IMG-20251224-WA0002.jpg",
  "/photos/IMG-20251231-WA0021.jpg",
  "/photos/IMG-20251231-WA0047.jpg",
  "/photos/IMG-20260305-WA0007.jpg",
  "/photos/IMG-20260305-WA0008.jpg",
  "/photos/IMG-20260305-WA0009.jpg",
  "/photos/IMG-20260305-WA0010.jpg",
  "/photos/IMG-20230111-WA0002.jpg",
  "/photos/IMG-20230116-WA0017.jpg",
  "/photos/IMG-20230116-WA0020.jpg",
  "/photos/IMG-20230123-WA0009.jpg",
  "/photos/IMG-20230208-WA0003.jpg",
  "/photos/IMG-20230314-WA0004.jpg",
  "/photos/IMG-20230314-WA0010.jpg",
  "/photos/IMG-20230429-WA0003.jpg",
  "/photos/IMG-20230429-WA0004.jpg",
  "/photos/Screenshot_20250417-231949_WhatsApp.jpg",
  "/photos/WIN_20250730_18_27_15_Pro.jpg",
  "/photos/WIN_20250730_18_27_18_Pro.jpg",
  "/photos/WIN_20250730_18_27_20_Pro.jpg",
  "/photos/WIN_20250730_18_27_23_Pro.jpg",
  "/photos/moment_dde32cf4db814b68a1e9d0d1f27148f3_1694163205846.jpg",
  "/photos/SmartSelect_20230113-193709_WhatsApp.jpg",
];

export default function MemoriesSection() {
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);
  const [shuffledPhotos, setShuffledPhotos] = useState<string[]>(photos);

  useEffect(() => {
    const next = [...photos];
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setShuffledPhotos(next);
  }, []);

  return (
    <section id="memories" className="min-h-screen px-4 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-[clamp(2rem,6vw,4rem)] font-bold text-stone-800">Memories</h2>

        <div className="mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <GlassCard className="p-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {shuffledPhotos.map((src, index) => (
                  <motion.div
                    key={src}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.04, duration: 0.35 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="relative h-48 overflow-hidden rounded-2xl cursor-zoom-in"
                    onMouseEnter={() => setHoveredPhoto(src)}
                    onMouseLeave={() => setHoveredPhoto(null)}
                  >
                    <Image
                      src={src}
                      alt="Memory"
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 32vw, 48vw"
                      priority={index < 4}
                    />
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <div className="mt-6 text-center text-xs uppercase tracking-[0.18em] text-stone-400">
            I can never thank you enough for everything you have done for me but I promise you one thing I love you bahut zyada and I will never ever leave your side.
          </div>
        </div>
      </div>

      {/* Full photo lightbox on hover */}
      <AnimatePresence>
        {hoveredPhoto && (
          <motion.div
            key={hoveredPhoto}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="relative max-h-[85vh] max-w-[85vw] w-full h-full">
              <Image
                src={hoveredPhoto}
                alt="Full preview"
                fill
                unoptimized
                className="object-contain drop-shadow-2xl"
                sizes="85vw"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
