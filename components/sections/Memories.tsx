"use client";

import GlassCard from "@/components/ui/GlassCard";
import { motion } from "framer-motion";

const notes = [
  "Your smile makes every ordinary day feel like a celebration.",
  "From random calls to long walks, every memory with you is priceless.",
  "Forever thankful that life gave me you.",
];

export default function MemoriesSection() {
  return (
    <section id="memories" className="min-h-screen px-4 py-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-[clamp(2rem,6vw,4rem)] font-bold text-stone-800">Memories</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {notes.map((note, index) => (
            <motion.div
              key={note}
              initial={{ opacity: 0, y: 18, rotate: index % 2 ? 2 : -2 }}
              whileInView={{ opacity: 1, y: 0, rotate: index % 2 ? 2 : -2 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, type: "spring" }}
            >
              <GlassCard className="min-h-44 p-6">
                <div className="text-3xl">📸</div>
                <p className="mt-4 text-stone-600">{note}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
