interface MarqueeStripProps {
  text?: string;
  duration?: number;
}

export default function MarqueeStrip({
  text = "happy birthday",
  duration = 20,
}: Readonly<MarqueeStripProps>) {
  // 12 copies → the first 6 fill one viewport width, the second 6 fill another,
  // so translateX(-50%) creates a seamless loop.
  const items = Array.from({ length: 12 }, (_, i) => `${text} · `);

  return (
    <div className="pointer-events-none overflow-hidden py-1" aria-hidden="true">
      <div
        className="flex whitespace-nowrap"
        style={{ animation: `marquee ${duration}s linear infinite` }}
      >
        {items.map((t, i) => (
          <span
            key={`marquee-item-${i}`}
            className="font-playfair italic px-3"
            style={{
              fontSize: "clamp(52px, 9vw, 84px)",
              color: "rgba(0,0,0,0.05)",
              lineHeight: 1.1,
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
