"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function getTimeLeft(targetDate: string) {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

interface CountdownTimerProps {
  targetDate: string;
  eyebrow?: string;
}

export default function CountdownTimer({
  targetDate,
  eyebrow = "so please join us...",
}: Readonly<CountdownTimerProps>) {
  const [time, setTime] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const id = globalThis.setInterval(
      () => setTime(getTimeLeft(targetDate)),
      1000,
    );
    return () => globalThis.clearInterval(id);
  }, [targetDate]);

  const units = [
    { label: "days",    value: time.days },
    { label: "hours",   value: time.hours },
    { label: "minutes", value: time.minutes },
    { label: "seconds", value: time.seconds },
  ];

  return (
    <section className="px-4 py-24 text-center">
      <p
        className="mb-10 text-sm italic"
        style={{ fontFamily: "var(--font-garamond), Georgia, serif", color: "var(--muted)" }}
      >
        {eyebrow}
      </p>

      <div className="flex items-end justify-center gap-8 md:gap-16">
        {units.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-3">
            <div
              className="font-playfair tabular-nums leading-none"
              style={{ fontSize: "clamp(3rem, 10vw, 6rem)", color: "var(--ghost)" }}
            >
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={value}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="block"
                >
                  {String(value).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
            </div>
            <span
              className="text-xs uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--font-garamond), Georgia, serif", color: "var(--muted)" }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
