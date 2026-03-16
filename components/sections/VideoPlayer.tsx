"use client";

import { friends } from "@/data/friends";
import GlassCard from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { Pause, Play, Volume2, Maximize2, RotateCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function VideoPlayerSection() {
  const [availableFriends, setAvailableFriends] = useState(() => [...friends]);
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hoveringVideo, setHoveringVideo] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [frameSize, setFrameSize] = useState({ width: 1, height: 1 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerFrameRef = useRef<HTMLDivElement>(null);
  const active = availableFriends[index];
  const activeRotation = active ? (rotations[active.id] ?? 0) : 0;
  const isQuarterTurn = activeRotation % 180 !== 0;

  const changeVideo = useCallback(
    (direction: "next" | "previous") => {
      if (!availableFriends.length) return;
      setCurrentTime(0);
      setDuration(0);
      setPlaying(false);
      setIndex((value) => {
        if (direction === "next") return (value + 1) % availableFriends.length;
        return (value - 1 + availableFriends.length) % availableFriends.length;
      });
    },
    [availableFriends.length]
  );

  const previous = () => changeVideo("previous");
  const next = () => changeVideo("next");

  const goTo = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= availableFriends.length) return;
      if (targetIndex === index) return;
      setCurrentTime(0);
      setDuration(0);
      setPlaying(false);
      setIndex(targetIndex);
    },
    [availableFriends.length, index]
  );

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  const updateProgress = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    setDuration(video.duration || 0);
  };

  const onVideoReady = async () => {
    updateProgress();
    if (autoplay) {
      try {
        await videoRef.current?.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
  };

  const seek = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setCurrentTime(value);
  };

  const updateVolume = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    const normalized = value / 100;
    video.volume = normalized;
    setVolume(value);
  };

  const fullscreen = async () => {
    const frame = playerFrameRef.current;
    if (!frame) return;

    if (document.fullscreenElement === frame) {
      await document.exitFullscreen();
      return;
    }

    await frame.requestFullscreen();
  };

  const rotateVideo = () => {
    if (!active) return;
    setRotations((value) => ({
      ...value,
      [active.id]: ((value[active.id] ?? 0) + 90) % 360,
    }));
  };

  useEffect(() => {
    if (index < availableFriends.length) return;
    setIndex(Math.max(availableFriends.length - 1, 0));
  }, [availableFriends.length, index]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === playerFrameRef.current);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const frame = playerFrameRef.current;
    if (!frame || typeof ResizeObserver === "undefined") return;

    const updateFrameSize = () => {
      const rect = frame.getBoundingClientRect();
      setFrameSize({
        width: Math.max(rect.width, 1),
        height: Math.max(rect.height, 1),
      });
    };

    updateFrameSize();
    const observer = new ResizeObserver(updateFrameSize);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [isFullscreen]);

  // Reload video in-place when src changes (avoids unmount/remount flicker)
  useEffect(() => {
    videoRef.current?.load();
  }, [active?.videoSrc]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;

      const section = document.getElementById("videos");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      event.preventDefault();
      void togglePlay();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePlay]);

  if (!active) {
    return (
      <section id="videos" className="min-h-screen px-4 py-24 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-[clamp(2rem,5vw,3rem)] font-bold" style={{ color: "var(--ink)" }}>
            Videos
          </h2>
          <GlassCard className="mt-8 p-8 text-center text-stone-500">
            No playable videos found yet.
          </GlassCard>
        </div>
      </section>
    );
  }

  const rotatedStyle = isQuarterTurn
    ? {
        position: "absolute" as const,
        left: "50%",
        top: "50%",
        width: `${(frameSize.height / frameSize.width) * 100}%`,
        height: `${(frameSize.width / frameSize.height) * 100}%`,
        transform: `translate(-50%, -50%) rotate(${activeRotation}deg)`,
      }
    : {
        transform: `rotate(${activeRotation}deg)`,
      };

  return (
    <section id="videos" className="min-h-screen px-4 py-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-[clamp(2rem,5vw,3rem)] font-bold"
        >
          <span style={{ color: "var(--ink)" }}>
            {active.name}
          </span>
        </motion.h2>

        <div className="mt-2 text-center text-sm text-stone-500">{active.relation}</div>

        <GlassCard className="mt-8 overflow-hidden p-3 md:p-4">
          <div
            ref={playerFrameRef}
            className={isFullscreen ? "relative h-screen w-screen overflow-hidden bg-black" : "relative aspect-video overflow-hidden rounded-2xl bg-black"}
            onMouseEnter={() => setHoveringVideo(true)}
            onMouseLeave={() => setHoveringVideo(false)}
          >
            <video
              ref={videoRef}
              poster={active.thumbnail}
              autoPlay={autoplay}
              className="h-full w-full bg-black object-contain transition-transform duration-200"
              src={active.videoSrc}
              preload="metadata"
              style={rotatedStyle}
              onTimeUpdate={updateProgress}
              onLoadedMetadata={onVideoReady}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => {
                if (autoplay) {
                  next();
                } else {
                  setPlaying(false);
                }
              }}
              onError={() => {
                const failingId = active.id;
                setPlaying(false);
                setCurrentTime(0);
                setDuration(0);
                setAvailableFriends((list) => list.filter((friend) => friend.id !== failingId));
              }}
            >
              <track kind="captions" src="/videos/captions.vtt" srcLang="en" label="English" />
            </video>

            <motion.button
              onClick={() => void togglePlay()}
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveringVideo ? 1 : 0 }}
              style={{ pointerEvents: hoveringVideo ? "auto" : "none" }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/40 text-white shadow-lg backdrop-blur-sm"
              aria-label={playing ? "Pause video" : "Play video"}
            >
              {playing ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
            </motion.button>

            <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/30 bg-black/50 p-3 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25 active:scale-95">
                  {playing ? <Pause size={16} /> : <Play size={16} />}
                </button>

                <input
                  type="range"
                  min={0}
                  max={duration || 1}
                  value={currentTime}
                  onChange={(event) => seek(Number(event.target.value))}
                  className="flex-1 accent-stone-700"
                />

                <div className="flex items-center gap-2">
                  <Volume2 size={14} className="text-white/80" />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={(event) => updateVolume(Number(event.target.value))}
                    className="w-20 accent-stone-700"
                  />
                </div>

                <button onClick={fullscreen} className="rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25 active:scale-95">
                  <Maximize2 size={16} />
                </button>

                <button
                  onClick={rotateVideo}
                  className="rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25 active:scale-95"
                  aria-label="Rotate video"
                  title={`Rotate video (${activeRotation}°)`}
                >
                  <RotateCw size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between px-2 text-sm text-stone-500">
            <span>
              {index + 1} of {availableFriends.length} friends
            </span>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={autoplay} onChange={(event) => setAutoplay(event.target.checked)} />
              {" "}
              Autoplay
            </label>
          </div>
        </GlassCard>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <motion.button
            onClick={previous}
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-full border border-stone-200 bg-white/70 px-5 py-3 text-sm transition hover:bg-white/90"
          >
            ← Previous
          </motion.button>
          {availableFriends.map((friend, dotIndex) => (
            <button
              key={friend.id}
              onClick={() => goTo(dotIndex)}
              className={`h-3 w-3 rounded-full transition ${dotIndex === index ? "bg-ink" : "bg-stone-300"}`}
              aria-label={`Go to ${friend.name}`}
            />
          ))}
          <motion.button
            onClick={next}
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-full border border-stone-200 bg-white/70 px-5 py-3 text-sm transition hover:bg-white/90"
          >
            Next →
          </motion.button>
        </div>
      </div>
    </section>
  );
}
