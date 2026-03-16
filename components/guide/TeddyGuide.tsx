"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// Types & guide messages
// ─────────────────────────────────────────────────────────────────────────────
type Reaction = "idle" | "excited" | "happy" | "surprised" | "love";

const GUIDE: Record<string, string[]> = {
  home:     ["보라해! (I purple you!) 💜", "BTS says: ARMY~!", "Scroll down, let's go! ✨"],
  music:    ["Connect Spotify 🎵", "BTS songs hit different 💜", "Dynamite? Butter? Your pick! 🌟"],
  videos:   ["Sweet videos, just for you! 🎬", "We all approve! 💜"],
  bouquet:  ["Pick flowers like a flower boy 🌸", "V loves flowers too 🌺", "Make it pretty~ 🎀"],
  story:    ["A letter from the heart 💌", "Read it like a BTS lyric 🤍"],
  memories: ["ARMY-worthy memories! 📸", "Purple forever 💜"],
};
const SECTION_IDS = ["home", "music", "videos", "bouquet", "story", "memories"];

import type React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Shared eye helper
// ─────────────────────────────────────────────────────────────────────────────
function EyePair({
  closed, wide, cx1 = 26, cx2 = 38, cy = 37,
}: { closed: boolean; wide: boolean; cx1?: number; cx2?: number; cy?: number }) {
  if (closed) return (
    <>
      <path d={`M${cx1 - 3} ${cy} Q${cx1} ${cy - 2.5} ${cx1 + 3} ${cy}`}
        stroke="#2A1A0E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d={`M${cx2 - 3} ${cy} Q${cx2} ${cy - 2.5} ${cx2 + 3} ${cy}`}
        stroke="#2A1A0E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </>
  );
  const rx = wide ? 3.5 : 2.8;
  const ry = wide ? 4   : 3.2;
  return (
    <>
      <ellipse cx={cx1} cy={cy} rx={rx} ry={ry} fill="#2A1A0E"/>
      <ellipse cx={cx2} cy={cy} rx={rx} ry={ry} fill="#2A1A0E"/>
      <circle  cx={cx1 + 1.2} cy={cy - 1.3} r="1" fill="white"/>
      <circle  cx={cx2 + 1.2} cy={cy - 1.3} r="1" fill="white"/>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KOYA (RM) — lavender koala
// ─────────────────────────────────────────────────────────────────────────────
function Koya({ mood }: { mood: Reaction }) {
  const closed = mood === "happy" || mood === "love";
  const wide   = mood === "surprised";
  const smile  = mood === "excited" || mood === "happy";
  return (
    <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
      {/* body */}
      <ellipse cx="32" cy="70" rx="21" ry="12" fill="#B8A4E0"/>
      <ellipse cx="32" cy="58" rx="19" ry="17" fill="#C4B2EC"/>
      {/* hood */}
      <ellipse cx="32" cy="34" rx="24" ry="25" fill="#C4B2EC"/>
      {/* koala round ears */}
      <ellipse cx="10" cy="13" rx="9.5" ry="10.5" fill="#D0C0F4"/>
      <ellipse cx="10" cy="13" rx="5.5"  ry="6.5"  fill="#A090CC"/>
      <ellipse cx="54" cy="13" rx="9.5" ry="10.5" fill="#D0C0F4"/>
      <ellipse cx="54" cy="13" rx="5.5"  ry="6.5"  fill="#A090CC"/>
      {/* face */}
      <ellipse cx="32" cy="37" rx="16.5" ry="17.5" fill="#FDDCBC"/>
      {/* hair */}
      <ellipse cx="32" cy="22" rx="14"  ry="8"   fill="#5A3A20"/>
      <ellipse cx="20" cy="27" rx="5"   ry="7"   fill="#5A3A20"/>
      <ellipse cx="44" cy="27" rx="4.5" ry="6"   fill="#5A3A20"/>
      {/* eyes */}
      <EyePair closed={closed} wide={wide}/>
      {/* blush */}
      <ellipse cx="19.5" cy="43" rx="4.5" ry="2.5" fill="#E897C0" opacity="0.62"/>
      <ellipse cx="44.5" cy="43" rx="4.5" ry="2.5" fill="#E897C0" opacity="0.62"/>
      {/* mouth */}
      {smile
        ? <path d="M27 47 Q32 52 37 47" stroke="#2A1A0E" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        : <path d="M28 47 Q32 50 36 47" stroke="#2A1A0E" strokeWidth="1.2" fill="none" strokeLinecap="round"/>}
      {/* paws */}
      <ellipse cx="15" cy="69" rx="7" ry="5" fill="#C4B2EC"/>
      <ellipse cx="49" cy="69" rx="7" ry="5" fill="#C4B2EC"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RJ (Jin) — cream alpaca
// ─────────────────────────────────────────────────────────────────────────────
function RJ({ mood }: { mood: Reaction }) {
  const closed = mood === "happy" || mood === "love";
  const wide   = mood === "surprised";
  const smile  = mood === "excited" || mood === "happy";
  return (
    <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
      <ellipse cx="32" cy="70" rx="21" ry="12" fill="#EEDAD8"/>
      <ellipse cx="32" cy="58" rx="19" ry="17" fill="#F5EBE0"/>
      <ellipse cx="32" cy="34" rx="24" ry="25" fill="#FFF4E8"/>
      {/* droopy alpaca ears */}
      <ellipse cx="14" cy="9"  rx="6"   ry="13.5" fill="#FFF0DC" transform="rotate(-14 14 9)"/>
      <ellipse cx="14" cy="9"  rx="3.2" ry="8.5"  fill="#E8C8A0" transform="rotate(-14 14 9)"/>
      <ellipse cx="50" cy="9"  rx="6"   ry="13.5" fill="#FFF0DC" transform="rotate(14 50 9)"/>
      <ellipse cx="50" cy="9"  rx="3.2" ry="8.5"  fill="#E8C8A0" transform="rotate(14 50 9)"/>
      {/* fluffy head poof */}
      <ellipse cx="32" cy="14" rx="11" ry="7.5" fill="white"/>
      <ellipse cx="24" cy="18" rx="7"  ry="5.5" fill="white"/>
      <ellipse cx="40" cy="18" rx="7"  ry="5.5" fill="white"/>
      {/* face */}
      <ellipse cx="32" cy="37" rx="16.5" ry="17.5" fill="#FDDCBC"/>
      <ellipse cx="32" cy="22" rx="13"   ry="6.5"  fill="#2A1A0E"/>
      <EyePair closed={closed} wide={wide}/>
      <ellipse cx="19.5" cy="43" rx="4.5" ry="2.5" fill="#FFB5C8" opacity="0.68"/>
      <ellipse cx="44.5" cy="43" rx="4.5" ry="2.5" fill="#FFB5C8" opacity="0.68"/>
      {/* alpaca muzzle */}
      <ellipse cx="32" cy="44" rx="5.5" ry="4"   fill="#EFD0A0"/>
      <ellipse cx="32" cy="42.5" rx="2" ry="1.4" fill="#2A1A0E"/>
      {smile
        ? <path d="M28 48 Q32 52 36 48" stroke="#2A1A0E" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        : <path d="M29 48 Q32 51 35 48" stroke="#2A1A0E" strokeWidth="1.2" fill="none" strokeLinecap="round"/>}
      <ellipse cx="15" cy="69" rx="7" ry="5" fill="#FFF4E8"/>
      <ellipse cx="49" cy="69" rx="7" ry="5" fill="#FFF4E8"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHOOKY (Suga) — dark cookie ghost
// ─────────────────────────────────────────────────────────────────────────────
function Shooky({ mood }: { mood: Reaction }) {
  const closed = mood === "happy" || mood === "love";
  const wide   = mood === "surprised";
  const smile  = mood === "excited" || mood === "happy";
  return (
    <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
      <ellipse cx="32" cy="70" rx="21" ry="12" fill="#3A3545"/>
      <ellipse cx="32" cy="58" rx="19" ry="17" fill="#46404F"/>
      <ellipse cx="32" cy="34" rx="24" ry="25" fill="#4E4858"/>
      {/* ghost nub ears */}
      <ellipse cx="20" cy="9.5" rx="6.5" ry="7.5" fill="#4E4858"/>
      <ellipse cx="44" cy="9.5" rx="6.5" ry="7.5" fill="#4E4858"/>
      <ellipse cx="32" cy="8"   rx="5"   ry="5.5" fill="#4E4858"/>
      {/* face */}
      <ellipse cx="32" cy="37" rx="16.5" ry="17.5" fill="#F0E8D5"/>
      <ellipse cx="32" cy="22" rx="14"   ry="7.5"  fill="#111111"/>
      <ellipse cx="21" cy="26" rx="5.5"  ry="7"    fill="#111111"/>
      <EyePair closed={closed} wide={wide} cy={37}/>
      <ellipse cx="19.5" cy="43" rx="4.5" ry="2.5" fill="#BBA0B8" opacity="0.55"/>
      <ellipse cx="44.5" cy="43" rx="4.5" ry="2.5" fill="#BBA0B8" opacity="0.55"/>
      {smile
        ? <path d="M26 47 Q32 53 38 47" stroke="#111" strokeWidth="1.5" fill="#F5D5C0" strokeLinecap="round"/>
        : <path d="M28 47 Q32 50.5 36 47" stroke="#111" strokeWidth="1.2" fill="none" strokeLinecap="round"/>}
      <ellipse cx="15" cy="69" rx="7" ry="5" fill="#4E4858"/>
      <ellipse cx="49" cy="69" rx="7" ry="5" fill="#4E4858"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MANG (J-Hope) — orange horse
// ─────────────────────────────────────────────────────────────────────────────
function Mang({ mood }: { mood: Reaction }) {
  const closed = mood === "happy" || mood === "love";
  const wide   = mood === "surprised";
  const smile  = mood === "excited" || mood === "happy";
  return (
    <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
      <ellipse cx="32" cy="70" rx="21" ry="12" fill="#FF8830"/>
      <ellipse cx="32" cy="58" rx="19" ry="17" fill="#FFA040"/>
      <ellipse cx="32" cy="34" rx="24" ry="25" fill="#FFB050"/>
      {/* pointed horse ears */}
      <ellipse cx="15" cy="8" rx="5.5" ry="10" fill="#FFB050" transform="rotate(-10 15 8)"/>
      <ellipse cx="15" cy="8" rx="3"   ry="6"  fill="#FF7020" transform="rotate(-10 15 8)"/>
      <ellipse cx="49" cy="8" rx="5.5" ry="10" fill="#FFB050" transform="rotate(10 49 8)"/>
      <ellipse cx="49" cy="8" rx="3"   ry="6"  fill="#FF7020" transform="rotate(10 49 8)"/>
      {/* mane */}
      <path d="M19 20 Q21 11 26 16 Q27 8 32 14 Q37 7 38 16 Q43 12 45 20" fill="#D47820"/>
      {/* face */}
      <ellipse cx="32" cy="37" rx="16.5" ry="17.5" fill="#FDDCBC"/>
      <ellipse cx="32" cy="22.5" rx="13"  ry="7"   fill="#C07010"/>
      <ellipse cx="20" cy="27"   rx="5"   ry="6.5" fill="#C07010"/>
      <EyePair closed={closed} wide={wide}/>
      <ellipse cx="19.5" cy="43" rx="4.5" ry="2.5" fill="#FF9898" opacity="0.65"/>
      <ellipse cx="44.5" cy="43" rx="4.5" ry="2.5" fill="#FF9898" opacity="0.65"/>
      {/* J-Hope big smile */}
      {smile
        ? <path d="M25 46 Q32 54 39 46" stroke="#2A1A0E" strokeWidth="1.7" fill="#FFDDB0" strokeLinecap="round"/>
        : <path d="M27 47 Q32 52 37 47" stroke="#2A1A0E" strokeWidth="1.3" fill="none" strokeLinecap="round"/>}
      <ellipse cx="15" cy="69" rx="7" ry="5" fill="#FFB050"/>
      <ellipse cx="49" cy="69" rx="7" ry="5" fill="#FFB050"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHIMMY (Jimin) — yellow puppy
// ─────────────────────────────────────────────────────────────────────────────
function Chimmy({ mood }: { mood: Reaction }) {
  const closed = mood === "happy" || mood === "love";
  const wide   = mood === "surprised";
  const smile  = mood === "excited" || mood === "happy";
  return (
    <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
      <ellipse cx="32" cy="70" rx="21" ry="12" fill="#FFCF40"/>
      <ellipse cx="32" cy="58" rx="19" ry="17" fill="#FFD955"/>
      <ellipse cx="32" cy="34" rx="24" ry="25" fill="#FFE368"/>
      {/* floppy puppy ears */}
      <ellipse cx="9"  cy="28" rx="8.5" ry="13" fill="#FFE368" transform="rotate(12 9 28)"/>
      <ellipse cx="9"  cy="28" rx="5"   ry="8"  fill="#F0C030" transform="rotate(12 9 28)"/>
      <ellipse cx="55" cy="28" rx="8.5" ry="13" fill="#FFE368" transform="rotate(-12 55 28)"/>
      <ellipse cx="55" cy="28" rx="5"   ry="8"  fill="#F0C030" transform="rotate(-12 55 28)"/>
      {/* pom dot */}
      <circle cx="32" cy="10" r="5.5" fill="#FFD955" stroke="#E0B020" strokeWidth="1.5"/>
      {/* face */}
      <ellipse cx="32" cy="37" rx="16.5" ry="17.5" fill="#FDDCBC"/>
      <ellipse cx="32" cy="22.5" rx="12.5" ry="6.5" fill="#B89870"/>
      <EyePair closed={closed} wide={wide}/>
      <ellipse cx="19.5" cy="43" rx="4.5" ry="2.5" fill="#FFB5C8" opacity="0.72"/>
      <ellipse cx="44.5" cy="43" rx="4.5" ry="2.5" fill="#FFB5C8" opacity="0.72"/>
      {smile
        ? <path d="M27 47 Q32 52 37 47" stroke="#2A1A0E" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        : <path d="M28 47 Q32 50.5 36 47" stroke="#2A1A0E" strokeWidth="1.2" fill="none" strokeLinecap="round"/>}
      <ellipse cx="15" cy="69" rx="7" ry="5" fill="#FFE368"/>
      <ellipse cx="49" cy="69" rx="7" ry="5" fill="#FFE368"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TATA (V) — lavender alien heart
// ─────────────────────────────────────────────────────────────────────────────
function Tata({ mood }: { mood: Reaction }) {
  const closed = mood === "happy" || mood === "love";
  const wide   = mood === "surprised";
  const smile  = mood === "excited" || mood === "happy";
  return (
    <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
      <ellipse cx="32" cy="70" rx="21" ry="12" fill="#9E78CC"/>
      <ellipse cx="32" cy="58" rx="19" ry="17" fill="#B28EE0"/>
      <ellipse cx="32" cy="34" rx="24" ry="25" fill="#C2A0F0"/>
      {/* TATA heart silhouette */}
      <path d="M20 18 Q20 8 32 13 Q44 8 44 18 Q44 28 32 34 Q20 28 20 18Z" fill="#D4B8FF"/>
      <path d="M26 14 Q26 10 32 12 Q38 10 38 14 Q38 17 32 20 Q26 17 26 14Z" fill="#E8D0FF"/>
      {/* face */}
      <ellipse cx="32" cy="37" rx="16.5" ry="17.5" fill="#FDDCBC"/>
      <ellipse cx="32" cy="22.5" rx="14"  ry="7.5" fill="#5A3A20"/>
      <ellipse cx="19"  cy="27"  rx="5.5" ry="7"   fill="#5A3A20"/>
      <ellipse cx="45"  cy="26"  rx="4.5" ry="6"   fill="#5A3A20"/>
      <text x="28.5" y="32" fontSize="7" fill="#FFE066">★</text>
      <EyePair closed={closed} wide={wide}/>
      <ellipse cx="19.5" cy="43" rx="4.5" ry="2.5" fill="#C8A0E8" opacity="0.62"/>
      <ellipse cx="44.5" cy="43" rx="4.5" ry="2.5" fill="#C8A0E8" opacity="0.62"/>
      {smile
        ? <path d="M27 47 Q32 52 37 47" stroke="#2A1A0E" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        : <path d="M28 47 Q32 50.5 36 47" stroke="#2A1A0E" strokeWidth="1.2" fill="none" strokeLinecap="round"/>}
      <ellipse cx="15" cy="69" rx="7" ry="5" fill="#C2A0F0"/>
      <ellipse cx="49" cy="69" rx="7" ry="5" fill="#C2A0F0"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COOKY (JK) — pink bunny
// ─────────────────────────────────────────────────────────────────────────────
function Cooky({ mood }: { mood: Reaction }) {
  const closed = mood === "happy" || mood === "love";
  const wide   = mood === "surprised";
  const smile  = mood === "excited" || mood === "happy";
  return (
    <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
      <ellipse cx="32" cy="70" rx="21" ry="12" fill="#F07090"/>
      <ellipse cx="32" cy="58" rx="19" ry="17" fill="#F888A8"/>
      <ellipse cx="32" cy="34" rx="24" ry="25" fill="#FCA0B8"/>
      {/* tall bunny ears */}
      <ellipse cx="19" cy="5"  rx="7"   ry="15" fill="#FCA0B8"/>
      <ellipse cx="19" cy="5"  rx="4"   ry="9.5" fill="#FFB5C8"/>
      <ellipse cx="45" cy="5"  rx="7"   ry="15" fill="#FCA0B8"/>
      <ellipse cx="45" cy="5"  rx="4"   ry="9.5" fill="#FFB5C8"/>
      {/* face */}
      <ellipse cx="32" cy="37" rx="16.5" ry="17.5" fill="#FDDCBC"/>
      <ellipse cx="32" cy="22.5" rx="14"  ry="7.5" fill="#1a1a1a"/>
      <ellipse cx="20" cy="27"   rx="5.5" ry="7"   fill="#1a1a1a"/>
      {/* JK iconic front lock */}
      <ellipse cx="34" cy="30" rx="3" ry="4.5" fill="#1a1a1a"/>
      <EyePair closed={closed} wide={wide}/>
      <ellipse cx="19.5" cy="43" rx="4.5" ry="2.5" fill="#FFB5C8" opacity="0.72"/>
      <ellipse cx="44.5" cy="43" rx="4.5" ry="2.5" fill="#FFB5C8" opacity="0.72"/>
      {smile
        ? <path d="M26 47 Q32 54 38 47" stroke="#2A1A0E" strokeWidth="1.5" fill="#FFF5F5" strokeLinecap="round"/>
        : <path d="M27 47 Q32 51.5 37 47" stroke="#2A1A0E" strokeWidth="1.3" fill="none" strokeLinecap="round"/>}
      <ellipse cx="15" cy="69" rx="7" ry="5" fill="#FCA0B8"/>
      <ellipse cx="49" cy="69" rx="7" ry="5" fill="#FCA0B8"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Members
// ─────────────────────────────────────────────────────────────────────────────
interface MemberEntry {
  id: string;
  name: string;
  label: string;
  Component: React.ComponentType<{ mood: Reaction }>;
}

const MEMBERS: MemberEntry[] = [
  { id: "koya",   name: "RM",     label: "RM",     Component: Koya   },
  { id: "rj",     name: "Jin",    label: "Jin",    Component: RJ     },
  { id: "shooky", name: "Suga",   label: "Suga",   Component: Shooky },
  { id: "mang",   name: "J-Hope", label: "J-Hope", Component: Mang   },
  { id: "chimmy", name: "Jimin",  label: "Jimin",  Component: Chimmy },
  { id: "tata",   name: "V",      label: "V",      Component: Tata   },
  { id: "cooky",  name: "JK",     label: "JK",     Component: Cooky  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sticker-huddle layout: 4 top + 3 bottom, slightly overlapping
// ─────────────────────────────────────────────────────────────────────────────
const HUDDLE: { top: number; left: number; size: number; zIndex: number }[] = [
  { top:  2, left:   4, size: 70, zIndex: 2 }, // Koya
  { top:  2, left:  68, size: 70, zIndex: 2 }, // RJ
  { top:  2, left: 132, size: 70, zIndex: 2 }, // Shooky
  { top:  2, left: 196, size: 70, zIndex: 2 }, // Mang
  { top: 56, left:  30, size: 78, zIndex: 3 }, // Chimmy
  { top: 56, left: 101, size: 78, zIndex: 3 }, // Tata
  { top: 56, left: 172, size: 78, zIndex: 3 }, // Cooky
];

// ─────────────────────────────────────────────────────────────────────────────
// Per-member Framer Motion animation
// ─────────────────────────────────────────────────────────────────────────────
function getAnim(i: number, reaction: Reaction) {
  const d = i * 0.15;
  const dir = i % 2 === 0 ? 1 : -1;
  if (reaction === "excited") return {
    y: [0, -12, 2, -8, 0],
    rotate: [0, dir * 10, 0],
    scale: [1, 1.14, 1],
    transition: { duration: 0.6, delay: d * 0.35, ease: "easeInOut" as const },
  };
  if (reaction === "happy") return {
    y: [0, -6, 0],
    rotate: [0, dir * 6, 0],
    transition: { duration: 0.8, delay: d, ease: "easeInOut" as const },
  };
  if (reaction === "surprised") return {
    y: [0, -10, 0],
    scale: [1, 1.1, 1],
    transition: { duration: 0.38, delay: d * 0.5 },
  };
  if (reaction === "love") return {
    rotate: [0, dir * 8, 0],
    y: [0, -4, 0],
    transition: { duration: 1.4, delay: d, repeat: Infinity, ease: "easeInOut" as const },
  };
  // idle float
  return {
    y: [0, -5, 0],
    rotate: [0, dir * 2.5, 0],
    transition: { duration: 2.4 + i * 0.22, delay: d, repeat: Infinity, ease: "easeInOut" as const },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
interface HeartParticle { id: number; dx: number }

export default function TeddyGuide() {
  const [activeSection, setActiveSection] = useState("home");
  const [msgIndex, setMsgIndex]           = useState(0);
  const [reaction, setReaction]           = useState<Reaction>("idle");
  const [minimized, setMinimized]         = useState(false);
  const [hearts, setHearts]               = useState<HeartParticle[]>([]);
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const msgs       = GUIDE[activeSection] ?? GUIDE.home;
  const currentMsg = msgs[msgIndex % msgs.length];

  const triggerReaction = useCallback((r: Reaction) => {
    setReaction(r);
    if (r === "love" || r === "excited") {
      setHearts((h) => [...h, { id: Date.now(), dx: Math.random() > 0.5 ? 22 : -22 }]);
    }
    if (reactionTimer.current) clearTimeout(reactionTimer.current);
    reactionTimer.current = setTimeout(() => setReaction("idle"), 2800);
  }, []);

  // Section scroll detection
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) { setActiveSection(id); triggerReaction("happy"); }
        },
        { threshold: 0.3 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [triggerReaction]);

  // Rotate messages when section changes
  useEffect(() => {
    setMsgIndex(0);
    const iv = setInterval(() => setMsgIndex((n) => n + 1), 4500);
    return () => clearInterval(iv);
  }, [activeSection]);

  // Custom events wired from BouquetBuilder / SpotifyProvider
  useEffect(() => {
    const map: Record<string, Reaction> = {
      "teddy:flower": "excited",
      "teddy:music":  "happy",
      "teddy:photo":  "love",
    };
    const handlers = Object.entries(map).map(([name, r]) => {
      const h = () => triggerReaction(r);
      window.addEventListener(name, h);
      return [name, h] as const;
    });
    return () => handlers.forEach(([name, h]) => window.removeEventListener(name, h));
  }, [triggerReaction]);

  // Expire hearts
  useEffect(() => {
    if (!hearts.length) return;
    const t = setTimeout(() => setHearts((h) => h.slice(1)), 2200);
    return () => clearTimeout(t);
  }, [hearts]);

  // ── Minimized pill
  if (minimized) {
    return (
      <motion.button
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }}
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-stone-200 bg-white/90 text-2xl shadow-lg backdrop-blur-sm"
        aria-label="Open BTS guide"
      >
        💜
      </motion.button>
    );
  }

  return (
    <div className="pointer-events-none fixed bottom-0 right-3 z-40 flex flex-col items-end pb-4">

      {/* Floating hearts */}
      <div className="pointer-events-none absolute bottom-[178px] right-[148px] h-0 w-0">
        <AnimatePresence>
          {hearts.map((heart) => (
            <motion.div
              key={heart.id}
              initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
              animate={{ opacity: 0, y: -80, x: heart.dx, scale: 1.4 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="pointer-events-none absolute select-none text-base"
            >
              💜
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMsg}
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.94 }}
          transition={{ duration: 0.26 }}
          className="pointer-events-auto relative mb-2 mr-5 max-w-[178px] rounded-2xl rounded-br-sm border border-stone-200 bg-white/96 px-3.5 py-2.5 text-center text-[12.5px] leading-snug text-stone-700 shadow-md backdrop-blur-sm"
          style={{ fontFamily: "EB Garamond, Georgia, serif", fontStyle: "italic" }}
        >
          {currentMsg}
          <span
            className="absolute -bottom-[7px] right-3.5 block h-3 w-3 rotate-45 border-b border-r border-stone-200 bg-white"
            aria-hidden="true"
          />
        </motion.div>
      </AnimatePresence>

      {/* BT21 chibi huddle */}
      <div
        className="pointer-events-auto relative cursor-pointer select-none"
        style={{ width: 278, height: 165 }}
        onClick={() => triggerReaction(reaction === "idle" ? "excited" : "love")}
        role="button"
        aria-label="BTS guide — click to cheer!"
      >
        {MEMBERS.map((member, i) => {
          const pos = HUDDLE[i];
          return (
            <motion.div
              key={member.id}
              className="absolute"
              style={{
                top:    pos.top,
                left:   pos.left,
                width:  pos.size,
                height: pos.size,
                zIndex: pos.zIndex,
              }}
              animate={getAnim(i, reaction)}
            >
              <member.Component mood={reaction} />
              <div
                className="absolute -bottom-3.5 left-0 right-0 text-center text-[8px] font-bold tracking-wide text-stone-400"
                style={{ fontFamily: "sans-serif" }}
              >
                {member.label}
              </div>
            </motion.div>
          );
        })}

        {/* Minimize button */}
        <button
          onClick={(e) => { e.stopPropagation(); setMinimized(true); }}
          className="absolute -right-1 top-0 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-stone-200 bg-white/90 text-[11px] leading-none text-stone-400 transition-colors hover:bg-white hover:text-stone-600"
          aria-label="Minimize"
        >
          ×
        </button>
      </div>

      <div className="h-5" />
    </div>
  );
}
