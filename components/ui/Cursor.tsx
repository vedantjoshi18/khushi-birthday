"use client";

import { useEffect, useRef, useState } from "react";

const TRAIL_COUNT = 9;

type Dot = { x: number; y: number };

export default function Cursor() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const mouse = useRef({ x: 0, y: 0 });
  const leader = useRef({ x: 0, y: 0 });
  const trail = useRef<Dot[]>(Array.from({ length: TRAIL_COUNT }, () => ({ x: 0, y: 0 })));
  const leaderRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const touch = window.matchMedia("(pointer: coarse)").matches;
    setIsTouch(touch);

    const onMove = (event: MouseEvent) => {
      setVisible(true);
      mouse.current.x = event.clientX;
      mouse.current.y = event.clientY;
    };

    const onLeave = () => setVisible(false);

    const hoverTargets = () =>
      document.querySelectorAll("a, button, [data-cursor-hover='true']");

    const handleHoverIn = () => setHovering(true);
    const handleHoverOut = () => setHovering(false);

    const attachHover = () => {
      hoverTargets().forEach((el) => {
        el.addEventListener("mouseenter", handleHoverIn);
        el.addEventListener("mouseleave", handleHoverOut);
      });
    };

    const detachHover = () => {
      hoverTargets().forEach((el) => {
        el.removeEventListener("mouseenter", handleHoverIn);
        el.removeEventListener("mouseleave", handleHoverOut);
      });
    };

    if (!touch) {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseout", onLeave);
      attachHover();
    }

    let raf = 0;
    const tick = () => {
      leader.current.x += (mouse.current.x - leader.current.x) * 0.2;
      leader.current.y += (mouse.current.y - leader.current.y) * 0.2;

      trail.current.forEach((dot, index) => {
        if (index === 0) {
          dot.x += (leader.current.x - dot.x) * 0.35;
          dot.y += (leader.current.y - dot.y) * 0.35;
          return;
        }
        dot.x += (trail.current[index - 1].x - dot.x) * 0.35;
        dot.y += (trail.current[index - 1].y - dot.y) * 0.35;
      });

      if (leaderRef.current) {
        const size = hovering ? 38 : 20;
        leaderRef.current.style.transform = `translate(${leader.current.x - size / 2}px, ${leader.current.y - size / 2}px)`;
        leaderRef.current.style.opacity = visible ? "1" : "0";
        leaderRef.current.style.width = `${size}px`;
        leaderRef.current.style.height = `${size}px`;
        leaderRef.current.style.background = hovering
          ? "#1a1a1a"
          : "#1a1a1a";
      }

      trail.current.forEach((dot, index) => {
        const element = dotRefs.current[index];
        if (!element) return;
        const size = 10 - index * 0.8;
        element.style.transform = `translate(${dot.x - size / 2}px, ${dot.y - size / 2}px)`;
        element.style.opacity = visible ? String(Math.max(0.08, 0.55 - index * 0.05)) : "0";
      });

      raf = requestAnimationFrame(tick);
    };

    if (!touch) raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (!touch) {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseout", onLeave);
        detachHover();
      }
    };
  }, []);

  if (isTouch) return null;

  return (
    <>
      {trail.current.map((_, index) => {
        const size = 10 - index * 0.8;
        return (
          <div
            key={`trail-${index}`}
            ref={(element) => {
              dotRefs.current[index] = element;
            }}
            className="pointer-events-none fixed z-[80] rounded-full"
            style={{
              width: size,
              height: size,
              opacity: 0,
              transform: "translate(-100px,-100px)",
              background: "#1a1a1a",
              boxShadow: "0 0 20px rgba(0,0,0,0.25)",
              transition: "opacity 200ms ease",
            }}
          />
        );
      })}
      <div
        ref={leaderRef}
        className="pointer-events-none fixed z-[81] rounded-full"
        style={{
          width: 20,
          height: 20,
          opacity: 0,
          transform: "translate(-100px,-100px)",
          background: "#1a1a1a",
          transition: "width 220ms ease,height 220ms ease,opacity 200ms ease",
          boxShadow: "0 0 35px rgba(0,0,0,0.25)",
        }}
      />
    </>
  );
}
