"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const MIN = 4;
const MAX = 12;
const CDN = "https://pub-4ac1b7f0da8c43e8983d7821a18a8c0d.r2.dev/color/flowers";

type Flower = {
  id: string;
  name: string;
  meaning: string;
  birthMonth: string;
};

const FLOWERS: Flower[] = [
  { id: "orchid",     name: "Orchid",      meaning: "Rare beauty",        birthMonth: "January"   },
  { id: "tulip",      name: "Tulip",       meaning: "Perfect love",       birthMonth: "April"     },
  { id: "carnation",  name: "Carnation",   meaning: "Pure love",          birthMonth: "January"   },
  { id: "anemone",    name: "Anemone",     meaning: "Anticipation",       birthMonth: "June"      },
  { id: "dahlia",     name: "Dahlia",      meaning: "Inner strength",     birthMonth: "August"    },
  { id: "zinnia",     name: "Zinnia",      meaning: "Lasting affection",  birthMonth: "August"    },
  { id: "rose",       name: "Rose",        meaning: "Deep love",          birthMonth: "June"      },
  { id: "sunflower",  name: "Sunflower",   meaning: "Adoration",          birthMonth: "September" },
  { id: "lily",       name: "Lily",        meaning: "Devotion",           birthMonth: "May"       },
  { id: "daisy",      name: "Daisy",       meaning: "New beginnings",     birthMonth: "April"     },
  { id: "peony",      name: "Peony",       meaning: "Prosperity",         birthMonth: "May"       },
  { id: "ranunculus", name: "Ranunculus",  meaning: "Radiant charm",      birthMonth: "March"     },
];

// Positions relative to bouquet center (270, 200) within a 540x460 canvas
const SLOTS = [
  { dx:   0, dy:   0, rotate:   0, size: 120, z: 10 },
  { dx: -80, dy: -46, rotate: -18, size: 112, z:  9 },
  { dx:  80, dy: -46, rotate:  18, size: 112, z:  9 },
  { dx: -36, dy:  54, rotate:  -8, size: 108, z:  8 },
  { dx:  36, dy:  54, rotate:   8, size: 108, z:  8 },
  { dx:   0, dy: -98, rotate:   0, size: 106, z:  7 },
  { dx:-130, dy:  -2, rotate: -30, size: 100, z:  6 },
  { dx: 130, dy:  -2, rotate:  30, size: 100, z:  6 },
  { dx: -58, dy:-114, rotate: -14, size: 102, z:  6 },
  { dx:  58, dy:-114, rotate:  14, size: 102, z:  6 },
  { dx: -90, dy:  70, rotate: -24, size:  96, z:  5 },
  { dx:  90, dy:  70, rotate:  24, size:  96, z:  5 },
];

// ── Bouquet wrapping options ───────────────────────────────────────────────
type Wrapping = {
  id: string;
  name: string;
  color: string;
  fold: string;
  pattern: "none" | "dots" | "lines";
};

const WRAPPINGS: Wrapping[] = [
  { id: "kraft",  name: "Kraft",    color: "#C8956C", fold: "#9A6840", pattern: "lines" },
  { id: "blush",  name: "Blush",    color: "#F2B8C0", fold: "#D88898", pattern: "none"  },
  { id: "sage",   name: "Sage",     color: "#9EBD98", fold: "#6E9468", pattern: "none"  },
  { id: "lilac",  name: "Lavender", color: "#C4B0E0", fold: "#9480C0", pattern: "dots"  },
  { id: "noir",   name: "Noir",     color: "#2A2A2A", fold: "#0a0a0a", pattern: "none"  },
  { id: "ivory",  name: "Ivory",    color: "#F5F0E8", fold: "#E0D8CC", pattern: "dots"  },
];

// ── Tooltip ────────────────────────────────────────────────────────────────
function FlowerTooltip({ flower }: Readonly<{ flower: Flower }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      transition={{ duration: 0.14 }}
      style={{
        position: "absolute",
        bottom: "calc(100% + 10px)",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#ffffff",
        border: "1.5px solid #1a1a1a",
        padding: "10px 16px",
        zIndex: 100,
        pointerEvents: "none",
        lineHeight: "1.85",
        whiteSpace: "nowrap",
        fontFamily: "'Courier New', Courier, monospace",
      }}
    >
      <p style={{ fontWeight: 700, letterSpacing: "0.06em", fontSize: "13px" }}>
        {flower.name.toUpperCase()}
      </p>
      <p style={{ fontSize: "12px", color: "#333" }}>{flower.meaning}</p>
      <p style={{ fontSize: "12px", color: "#333" }}>
        Birth Month: {flower.birthMonth}
      </p>
    </motion.div>
  );
}

// ── Flower picker card ─────────────────────────────────────────────────────
function FlowerCard({
  flower,
  count,
  atMax,
  onAdd,
  onRemove,
}: Readonly<{
  flower: Flower;
  count: number;
  atMax: boolean;
  onAdd: () => void;
  onRemove: (e: React.MouseEvent) => void;
}>) {
  const [hovered, setHovered] = useState(false);
  const canAdd = !atMax || count > 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: atMax && count === 0 ? 0.32 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {/* Tooltip */}
      <AnimatePresence>{hovered && <FlowerTooltip flower={flower} />}</AnimatePresence>

      {/* Image button */}
      <motion.button
        onClick={onAdd}
        disabled={!canAdd}
        whileHover={canAdd ? { scale: 1.07, y: -5 } : {}}
        whileTap={canAdd ? { scale: 0.95 } : {}}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className="flex flex-col items-center gap-2 p-2"
        style={{ cursor: canAdd ? "pointer" : "not-allowed" }}
        aria-label={`Add ${flower.name}`}
      >
        <div style={{ width: "128px", height: "128px", position: "relative" }}>
          <Image
            src={`${CDN}/${flower.id}.webp`}
            alt={flower.name}
            fill
            sizes="128px"
            unoptimized
            style={{ objectFit: "contain" }}
            draggable={false}
          />
        </div>

        {/* "click to add" indicator */}
        {canAdd && (
          <motion.span
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "11px",
              letterSpacing: "0.1em",
              color: "#1a1a1a",
            }}
          >
            + ADD
          </motion.span>
        )}
      </motion.button>

      {/* Count badge — click removes one */}
      <AnimatePresence>
        {count > 0 && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={onRemove}
            whileHover={{ scale: 1.18 }}
            whileTap={{ scale: 0.88 }}
            title="Click to remove one"
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "#1a1a1a",
              color: "#fff",
              fontFamily: "'Courier New', Courier, monospace",
              fontWeight: 700,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {count}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function BouquetBuilder() {
  const [counts, setCounts]             = useState<Record<string, number>>({});
  const [done, setDone]                 = useState(false);
  const [selectedWrap, setSelectedWrap] = useState<string | null>(null);

  const total      = Object.values(counts).reduce((s, n) => s + n, 0);
  const activeWrap = selectedWrap ? (WRAPPINGS.find((w) => w.id === selectedWrap) ?? null) : null;

  function add(id: string) {
    if (done || total >= MAX) return;
    setCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    window.dispatchEvent(new CustomEvent("teddy:flower"));
  }

  function remove(id: string) {
    setCounts((prev) => {
      const next = (prev[id] ?? 0) - 1;
      if (next <= 0) {
        const { [id]: _dropped, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  }

  // Build the flat ordered list of blooms for the bouquet
  const bloomList: Array<{ flower: Flower; slot: (typeof SLOTS)[number] }> = [];
  Object.entries(counts).forEach(([id, count]) => {
    const flower = FLOWERS.find((f) => f.id === id)!;
    for (let i = 0; i < count; i++) {
      bloomList.push({ flower, slot: SLOTS[bloomList.length % SLOTS.length] });
    }
  });

  // Bouquet center coords (relative to 540×460 SVG canvas)
  const CX = 270;
  const CY = 200;
  const STEM_Y = 430;

  return (
    <section id="bouquet" className="px-4 py-24" style={{ background: "var(--cream)" }}>
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center"
        >
          <p
            className="italic text-sm"
            style={{ fontFamily: "var(--font-garamond),Georgia,serif", color: "var(--muted)" }}
          >
            a gift from me to you
          </p>
          <h2
            className="mt-2 font-playfair leading-tight"
            style={{ fontSize: "clamp(2rem,6vw,3.8rem)", color: "var(--ink)" }}
          >
            build her bouquet
          </h2>
          <p
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              letterSpacing: "0.1em",
              fontSize: "13px",
              color: "var(--muted)",
              marginTop: "12px",
              textTransform: "uppercase",
            }}
          >
            PICK {MIN} TO {MAX} BLOOMS
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── PICKER ── */}
          {!done && (
            <motion.div key="picker" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex flex-wrap justify-center gap-4">
                {FLOWERS.map((flower) => (
                  <FlowerCard
                    key={flower.id}
                    flower={flower}
                    count={counts[flower.id] ?? 0}
                    atMax={total >= MAX}
                    onAdd={() => add(flower.id)}
                    onRemove={(e) => { e.stopPropagation(); remove(flower.id); }}
                  />
                ))}
              </div>

              {/* Controls bar */}
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                <p
                  style={{
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: "13px",
                    color: "var(--muted)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {total === 0
                    ? "hover to learn, click to add"
                    : `${total} / ${MAX} BLOOMS SELECTED`}
                </p>

                <motion.button
                  onClick={() => { if (total >= MIN) setDone(true); }}
                  whileHover={total >= MIN ? { scale: 1.04 } : {}}
                  whileTap={total >= MIN ? { scale: 0.96 } : {}}
                  style={{
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: "12px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "11px 28px",
                    borderRadius: "999px",
                    background: total >= MIN ? "#1a1a1a" : "rgba(0,0,0,0.08)",
                    color: total >= MIN ? "#fff" : "var(--muted)",
                    cursor: total >= MIN ? "pointer" : "default",
                    border: "none",
                  }}
                >
                  {total < MIN ? `Need ${MIN - total} more` : "Make the bouquet →"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── BOUQUET ── */}
          {done && (
            <motion.div
              key="bouquet"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-10"
            >
              {/* Canvas */}
              <div style={{ overflowX: "auto", width: "100%", display: "flex", justifyContent: "center" }}>
                <div style={{ position: "relative", width: "540px", height: "460px", flexShrink: 0 }}>

                  {/* SVG stems */}
                  <svg
                    width="540"
                    height="460"
                    viewBox="0 0 540 460"
                    style={{ position: "absolute", inset: 0, zIndex: 1 }}
                  >
                    {bloomList.map((bloom, i) => {
                      const fx = CX + bloom.slot.dx;
                      const fy = CY + bloom.slot.dy + bloom.slot.size * 0.45;
                      const ctrlX = (fx + CX) / 2;
                      const ctrlY = fy + 50;
                      return (
                        <motion.path
                          key={i}
                          d={`M ${fx} ${fy} Q ${ctrlX} ${ctrlY} ${CX} ${STEM_Y}`}
                          stroke="#4a6741"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          fill="none"
                          opacity={0.5}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: i * 0.07, duration: 0.55, ease: "easeOut" }}
                        />
                      );
                    })}
                  </svg>

                  {/* Blooms */}
                  {bloomList.map((bloom, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.25, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.08, type: "spring", stiffness: 240, damping: 18 }}
                      style={{
                        position: "absolute",
                        left: `${CX + bloom.slot.dx - bloom.slot.size / 2}px`,
                        top: `${CY + bloom.slot.dy - bloom.slot.size / 2}px`,
                        width: `${bloom.slot.size}px`,
                        height: `${bloom.slot.size}px`,
                        rotate: `${bloom.slot.rotate}deg`,
                        zIndex: bloom.slot.z,
                      }}
                    >
                      <Image
                        src={`${CDN}/${bloom.flower.id}.webp`}
                        alt={bloom.flower.name}
                        fill
                        sizes={`${bloom.slot.size}px`}
                        unoptimized
                        style={{ objectFit: "contain" }}
                        draggable={false}
                      />
                    </motion.div>
                  ))}

                  {/* Wrapping paper overlay */}
                  {activeWrap && (
                    <svg
                      width="540"
                      height="460"
                      viewBox="0 0 540 460"
                      style={{ position: "absolute", inset: 0, zIndex: 2 }}
                    >
                      <defs>
                        {activeWrap.pattern === "dots" && (
                          <pattern id={`wp-${activeWrap.id}`} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                            <circle cx="6" cy="6" r="1.6" fill="rgba(255,255,255,0.28)" />
                          </pattern>
                        )}
                        {activeWrap.pattern === "lines" && (
                          <pattern id={`wp-${activeWrap.id}`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                            <line x1="0" y1="0" x2="10" y2="10" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
                          </pattern>
                        )}
                      </defs>
                      {/* main cone */}
                      <path d="M 148 310 L 392 310 L 345 448 L 195 448 Z" fill={activeWrap.color} />
                      {activeWrap.pattern !== "none" && (
                        <path d="M 148 310 L 392 310 L 345 448 L 195 448 Z" fill={`url(#wp-${activeWrap.id})`} />
                      )}
                      {/* fold highlight */}
                      <path d="M 148 310 L 392 310 L 376 328 L 164 328 Z" fill={activeWrap.fold} opacity="0.8" />
                    </svg>
                  )}

                  {/* Ribbon */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: bloomList.length * 0.08 + 0.1, type: "spring" }}
                    style={{
                      position: "absolute",
                      bottom: "14px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "38px",
                      zIndex: 20,
                      lineHeight: 1,
                    }}
                  >
                    🎀
                  </motion.div>
                </div>
              </div>

              {/* Wrapping selector */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: bloomList.length * 0.08 + 0.28 }}
                className="flex flex-col items-center gap-3"
              >
                <p
                  style={{
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: "11px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                  }}
                >
                  choose your wrapping
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {WRAPPINGS.map((wrap) => (
                    <button
                      key={wrap.id}
                      onClick={() => setSelectedWrap(wrap.id === selectedWrap ? null : wrap.id)}
                      title={wrap.name}
                      className="flex flex-col items-center gap-1.5"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.94 }}
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "50%",
                          background: wrap.color,
                          border: selectedWrap === wrap.id ? "2.5px solid #1a1a1a" : "2.5px solid rgba(0,0,0,0.12)",
                          boxShadow: selectedWrap === wrap.id
                            ? "0 0 0 3px #fff, 0 0 0 5px #1a1a1a"
                            : "0 1px 4px rgba(0,0,0,0.12)",
                          position: "relative",
                          overflow: "hidden",
                          transition: "box-shadow 0.18s, border-color 0.18s",
                        }}
                      >
                        {wrap.pattern === "dots" && (
                          <svg width="46" height="46" style={{ position: "absolute", inset: 0 }}>
                            {[0, 1, 2, 3].flatMap((r) =>
                              [0, 1, 2, 3].map((c) => (
                                <circle key={`${r}-${c}`} cx={5 + c * 11} cy={5 + r * 11} r="1.5" fill="rgba(255,255,255,0.35)" />
                              )),
                            )}
                          </svg>
                        )}
                        {wrap.pattern === "lines" && (
                          <svg width="46" height="46" style={{ position: "absolute", inset: 0 }}>
                            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                              <line key={i} x1={-4 + i * 8} y1="0" x2={-4 + i * 8 + 46} y2="46" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
                            ))}
                          </svg>
                        )}
                        {selectedWrap === wrap.id && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                              position: "absolute", inset: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "16px",
                              color: wrap.id === "noir" ? "#fff" : "#1a1a1a",
                            }}
                          >
                            ✓
                          </motion.span>
                        )}
                      </motion.div>
                      <span
                        style={{
                          fontFamily: "'Courier New', Courier, monospace",
                          fontSize: "10px",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: selectedWrap === wrap.id ? "var(--ink)" : "var(--muted)",
                          fontWeight: selectedWrap === wrap.id ? 700 : 400,
                        }}
                      >
                        {wrap.name}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Flower name list */}
              <p
                style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  color: "var(--muted)",
                  textAlign: "center",
                  maxWidth: "480px",
                  textTransform: "uppercase",
                }}
              >
                {bloomList.map((b) => b.flower.name).join("  ·  ")}
              </p>

              {/* Message card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: bloomList.length * 0.08 + 0.4 }}
                style={{
                  border: "1px solid rgba(0,0,0,0.1)",
                  background: "#fff",
                  padding: "28px 40px",
                  textAlign: "center",
                  maxWidth: "400px",
                }}
              >
                <p
                  className="font-playfair"
                  style={{ fontSize: "clamp(1.2rem,4vw,1.7rem)", color: "var(--ink)" }}
                >
                  for you, with love 🤍
                </p>
                <p
                  className="mt-2 italic"
                  style={{
                    fontFamily: "var(--font-garamond),Georgia,serif",
                    fontSize: "14px",
                    color: "var(--muted)",
                  }}
                >
                  A bouquet as beautiful as you are, Khushi.
                </p>
              </motion.div>

              <button
                onClick={() => { setCounts({}); setDone(false); setSelectedWrap(null); }}
                style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                  color: "var(--muted)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                arrange a new bouquet
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
