"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  animate,
  useMotionValue,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import MarqueeStrip from "./MarqueeStrip";

const BIRTHDAY_DATE = "2026-03-18T00:00:00";
/** Total wheel-delta units to travel before all cards are fanned */
const TOTAL_DELTA = 1400;

const photos = [
  { file: "photo-1.jpg", label: "always shining",   stackRot:  2, fanX: -252, fanY:  -50, fanRot: -13 },
  { file: "photo-2.jpg", label: "daku mangal singh",    stackRot: -3, fanX:  210, fanY:  -88, fanRot:   8 },
  { file: "photo-3.jpg", label: "PYARI",       stackRot:  5, fanX:  -82, fanY:   92, fanRot:  -4 },
  { file: "photo-4.jpg", label: "golden moments",    stackRot: -2, fanX:  254, fanY:   65, fanRot:  15 },
  { file: "photo-5.jpg", label: "u da real beauty",        stackRot:  7, fanX: -238, fanY:   74, fanRot: -10 },
  { file: "photo-6.jpg", label: "my world",          stackRot: -4, fanX:   50, fanY: -130, fanRot:  19 },
];

const slideshowPhotos = photos.filter((photo) => photo.file !== "photo-3.jpg");

const FAN_WINDOWS = [
  [0,    0.22],
  [0.13, 0.35],
  [0.26, 0.48],
  [0.39, 0.61],
  [0.52, 0.74],
  [0.65, 0.87],
] as const;

type PhotoDef = (typeof photos)[number];

/* ── Shared polaroid shell ─────────────────────────────────────────── */
function PolaroidContent({ photo }: Readonly<{ photo: PhotoDef }>) {
  return (
    <div
      style={{
        background: "#fffef8",
        padding: "10px 10px 36px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.08)",
        width: "176px",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <div className="relative overflow-hidden" style={{ height: "210px" }}>
        <div
          className="absolute inset-0"
          style={{ background: "#1a1a1a" }}
        />
        <Image
          src={`/photos/${photo.file}`}
          alt={photo.label}
          fill
          sizes="176px"
          className="relative object-cover"
          draggable={false}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <p
        style={{
          fontFamily: "var(--font-garamond),Georgia,serif",
          fontStyle: "italic",
          fontSize: "13px",
          color: "#999",
          textAlign: "center",
          marginTop: "8px",
        }}
      >
        {photo.label}
      </p>
    </div>
  );
}

/* ── Fan card (scroll-driven, not draggable) ───────────────────────── */
function FanCard({
  photo,
  index,
  progress,
}: Readonly<{ photo: PhotoDef; index: number; progress: MotionValue<number> }>) {
  const [start, end] = FAN_WINDOWS[index];
  const x      = useTransform(progress, [start, end], [0, photo.fanX]);
  const y      = useTransform(progress, [start, end], [0, photo.fanY]);
  const rotate = useTransform(progress, [start, end], [photo.stackRot, photo.fanRot]);

  return (
    <motion.div
      style={{ x, y, rotate, zIndex: photos.length - index }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <PolaroidContent photo={photo} />
    </motion.div>
  );
}

/* ── Drag card (starts at fanned position, freely moveable) ────────── */
function DragCard({ photo, index }: Readonly<{ photo: PhotoDef; index: number }>) {
  const [lifted, setLifted] = useState(false);
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.06}
      initial={{ x: photo.fanX, y: photo.fanY, rotate: photo.fanRot }}
      style={{ zIndex: lifted ? 50 : photos.length - index }}
      whileHover={{ scale: 1.04 }}
      whileDrag={{ scale: 1.07 }}
      onDragStart={() => setLifted(true)}
      onDragEnd={() => setLifted(false)}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
    >
      <PolaroidContent photo={photo} />
    </motion.div>
  );
}

/* ── Heading variants ──────────────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" } },
};

/* ── Hero ──────────────────────────────────────────────────────────── */
export default function Hero() {
  const progress    = useMotionValue(0);
  const accRef      = useRef(0);
  const doneRef     = useRef(false);
  const touchYRef   = useRef(0);
  const [fanDone, setFanDone] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    if (slideshowPhotos.length <= 1) return;
    const timer = globalThis.setInterval(() => {
      setBgIndex((value) => (value + 1) % slideshowPhotos.length);
    }, 4300);
    return () => globalThis.clearInterval(timer);
  }, []);

  useEffect(() => {
    // Lock the page
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    function complete() {
      if (doneRef.current) return;
      doneRef.current = true;
      animate(progress, 1, { duration: 0.2, ease: "easeOut" }).then(() => {
        // Unlock page, snap to top, enable drag mode
        document.documentElement.style.overflow = prevHtml;
        document.body.style.overflow = prevBody;
        window.scrollTo(0, 0);
        setFanDone(true);
      });
    }

    function advance(rawDelta: number) {
      if (doneRef.current) return;
      const prev = accRef.current;
      accRef.current = Math.min(Math.max(prev + rawDelta, 0), TOTAL_DELTA);
      const p = accRef.current / TOTAL_DELTA;
      animate(progress, p, { duration: 0.3, ease: "easeOut" });
      if (accRef.current >= TOTAL_DELTA) complete();
    }

    function onWheel(e: WheelEvent) {
      if (doneRef.current) return;
      // Allow scrolling back up past the hero only when at the very start
      if (e.deltaY < 0 && accRef.current <= 0) return;
      e.preventDefault();
      e.stopPropagation();
      advance(e.deltaY);
    }

    function onTouchStart(e: TouchEvent) {
      touchYRef.current = e.touches[0].clientY;
    }

    function onTouchMove(e: TouchEvent) {
      if (doneRef.current) return;
      const dy = touchYRef.current - e.touches[0].clientY;
      touchYRef.current = e.touches[0].clientY;
      if (dy < 0 && accRef.current <= 0) return;
      e.preventDefault();
      advance(dy * 2.2);
    }

    // Capture phase so we intercept before any child handlers
    window.addEventListener("wheel",      onWheel,      { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true,  capture: false });
    window.addEventListener("touchmove",  onTouchMove,  { passive: false, capture: true });

    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      window.removeEventListener("wheel",      onWheel,      { capture: true });
      window.removeEventListener("touchstart", onTouchStart, { capture: false });
      window.removeEventListener("touchmove",  onTouchMove,  { capture: true });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <section id="home" style={{ height: "100vh" }}>
        <div className="relative flex h-screen flex-col">

          {/* ── Background slideshow ── */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {slideshowPhotos.map((photo, idx) => (
              <motion.div
                key={photo.file}
                initial={false}
                animate={{ opacity: idx === bgIndex ? 1 : 0 }}
                transition={{ duration: 1.35, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={`/photos/${photo.file}`}
                  alt={photo.label}
                  fill
                  priority={idx === 0}
                  unoptimized
                  sizes="100vw"
                  className="object-cover"
                  draggable={false}
                />
              </motion.div>
            ))}

            {/* Soft translucent veil for readability */}
            <div className="absolute inset-0 bg-white/30" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,255,255,0.42),transparent_56%),radial-gradient(circle_at_85%_78%,rgba(255,255,255,0.25),transparent_52%)]" />
          </div>

          {/* ── Headline ── */}
          <motion.header
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative z-10 flex-none px-4 pb-4 pt-20 text-center"
          >
            <motion.p
              variants={itemVariants}
              className="text-sm italic"
              style={{ fontFamily: "var(--font-garamond),Georgia,serif", color: "var(--muted)" }}
            >
              I LOVE YOU
            </motion.p>

            <motion.h1
              variants={itemVariants}
              className="mt-3 font-playfair leading-[1.05]"
              style={{ fontSize: "clamp(2.4rem,7vw,5.5rem)", color: "var(--ink)" }}
            >
              happy birthday
              <br />
              <em>Khushi</em>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mx-auto mt-3 italic"
              style={{
                fontFamily: "var(--font-garamond),Georgia,serif",
                fontSize: "clamp(0.95rem,2.2vw,1.1rem)",
                color: "var(--muted)",
                maxWidth: "440px",
              }}
            >
              ek chota sa gift meri taraf se
            </motion.p>
          </motion.header>

          {/* ── Polaroid area ── */}
          <div className="relative flex-1 w-full">
            {photos.map((photo, index) =>
              fanDone ? (
                <DragCard key={photo.file} photo={photo} index={index} />
              ) : (
                <FanCard key={photo.file} photo={photo} index={index} progress={progress} />
              ),
            )}
          </div>

          {/* ── Hint (scroll → drag) ── */}
          <motion.div
            className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <AnimatePresence mode="wait">
              {fanDone ? (
                <motion.p
                  key="drag"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, delay: 0.35 }}
                  style={{
                    color: "var(--muted)",
                    fontSize: "13px",
                    fontFamily: "var(--font-garamond),Georgia,serif",
                    fontStyle: "italic",
                    whiteSpace: "nowrap",
                  }}
                >
                  drag the photos &middot; scroll to continue ↓
                </motion.p>
              ) : (
                <motion.p
                  key="scroll"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, y: [0, 6, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ opacity: { duration: 0.4 }, y: { repeat: Infinity, duration: 1.7 } }}
                  style={{
                    color: "var(--muted)",
                    fontSize: "13px",
                    fontFamily: "var(--font-garamond),Georgia,serif",
                    fontStyle: "italic",
                    whiteSpace: "nowrap",
                  }}
                >
                  scroll to reveal the photos ↓
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Ghost marquee ── */}
          <div className="flex-none overflow-hidden">
            <MarqueeStrip />
          </div>

        </div>
      </section>

      <CountdownTimer
        targetDate={BIRTHDAY_DATE}
        eyebrow="counting down to her next chapter ·"
      />
    </>
  );
}
