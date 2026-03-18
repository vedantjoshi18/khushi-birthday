"use client";

import { useEffect, useRef, useState } from "react";
import {
  Volume2,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Shuffle,
  Repeat,
  Heart,
  MonitorSmartphone,
} from "lucide-react";
import { useSpotify } from "./SpotifyProvider";

function formatMs(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function PlayerControls() {
  const {
    playback,
    togglePlay,
    previousTrack,
    nextTrack,
    seek,
    setVolume,
    setShuffle,
    cycleRepeat,
    devices,
    loadDevices,
    transferPlayback,
    deviceId,
  } = useSpotify();

  const [liked, setLiked] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const [localVolume, setLocalVolume] = useState(70);
  const [draggingProgress, setDraggingProgress] = useState(false);
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const playbackSnapshotRef = useRef({
    progressMs: 0,
    durationMs: 0,
    isPlaying: false,
    at: 0,
  });
  const volumeCommitTimerRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);

  useEffect(() => {
    progressRef.current = localProgress;
  }, [localProgress]);

  useEffect(() => {
    if (!draggingProgress) {
      const now = performance.now();
      playbackSnapshotRef.current = {
        progressMs: playback.progressMs,
        durationMs: playback.durationMs,
        isPlaying: playback.isPlaying,
        at: now,
      };
      setLocalProgress(playback.progressMs);
      progressRef.current = playback.progressMs;
    }
  }, [draggingProgress, playback.durationMs, playback.isPlaying, playback.progressMs]);

  useEffect(() => {
    if (draggingProgress) return;

    const animate = () => {
      const snapshot = playbackSnapshotRef.current;
      if (!snapshot.durationMs) {
        rafRef.current = globalThis.requestAnimationFrame(animate);
        return;
      }

      if (snapshot.isPlaying) {
        const elapsed = performance.now() - snapshot.at;
        const interpolated = Math.min(snapshot.progressMs + elapsed, snapshot.durationMs);
        if (Math.abs(interpolated - progressRef.current) > 12) {
          setLocalProgress(interpolated);
          progressRef.current = interpolated;
        }
      }

      rafRef.current = globalThis.requestAnimationFrame(animate);
    };

    rafRef.current = globalThis.requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        globalThis.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [draggingProgress]);

  useEffect(() => {
    return () => {
      if (volumeCommitTimerRef.current) {
        globalThis.clearTimeout(volumeCommitTimerRef.current);
        volumeCommitTimerRef.current = null;
      }
    };
  }, []);

  const repeatActive = playback.repeatState === "context" || playback.repeatState === "track";

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={playback.durationMs || 100}
          value={Math.min(localProgress, playback.durationMs || 100)}
          onPointerDown={() => setDraggingProgress(true)}
          onChange={(event) => {
            const value = Number(event.target.value);
            setLocalProgress(value);
            progressRef.current = value;
          }}
          onPointerUp={async (event) => {
            setDraggingProgress(false);
            const value = Number((event.target as HTMLInputElement).value);
            setLocalProgress(value);
            progressRef.current = value;
            await seek(value);
          }}
          className="w-full accent-stone-700"
        />
        <div className="flex justify-between text-xs text-stone-400">
          <span>{formatMs(localProgress)}</span>
          <span>{formatMs(playback.durationMs)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button onClick={() => void setShuffle(!playback.shuffle)} className={`rounded-full p-2 ${playback.shuffle ? "text-ink" : "text-stone-400"}`}>
          <Shuffle size={18} />
        </button>
        <button onClick={() => void previousTrack()} className="rounded-full p-2 text-stone-700">
          <SkipBack size={24} />
        </button>
        <button
          onClick={() => void togglePlay()}
          className="rounded-full bg-ink p-4 text-white shadow-[0_0_25px_rgba(0,0,0,.25)]"
        >
          {playback.isPlaying ? <Pause size={26} /> : <Play size={26} className="ml-0.5" />}
        </button>
        <button onClick={() => void nextTrack()} className="rounded-full p-2 text-stone-700">
          <SkipForward size={24} />
        </button>
        <button onClick={() => void cycleRepeat()} className={`rounded-full p-2 ${repeatActive ? "text-ink" : "text-stone-400"}`}>
          <Repeat size={18} />
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setLiked((state) => !state)}
          className={`rounded-full p-2 transition ${liked ? "text-ink" : "text-stone-400"}`}
        >
          <Heart fill={liked ? "currentColor" : "none"} size={18} />
        </button>

        <div className="flex flex-1 items-center gap-2">
          <Volume2 size={16} className="text-stone-400" />
          <input
            type="range"
            min={0}
            max={100}
            value={localVolume}
            onChange={(event) => {
              const value = Number(event.target.value);
              setLocalVolume(value);
              if (volumeCommitTimerRef.current) {
                globalThis.clearTimeout(volumeCommitTimerRef.current);
              }
              volumeCommitTimerRef.current = globalThis.setTimeout(() => {
                setVolume(value).catch(() => null);
              }, 120);
            }}
            onPointerUp={async (event) => {
              const value = Number((event.target as HTMLInputElement).value);
              if (volumeCommitTimerRef.current) {
                globalThis.clearTimeout(volumeCommitTimerRef.current);
                volumeCommitTimerRef.current = null;
              }
              await setVolume(value);
            }}
            className="w-full accent-stone-700"
          />
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white/60 p-2">
        <div className="mb-1 flex items-center gap-2 px-1 text-xs text-stone-500">
          <MonitorSmartphone size={14} /> Devices
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => void loadDevices()} className="rounded-lg border border-stone-200 px-2 py-1 text-xs text-stone-600">
            Refresh
          </button>
          {devices.map((device) => (
            <button
              key={device.id}
              onClick={() => void transferPlayback(device.id)}
              className={`rounded-lg border px-2 py-1 text-xs ${
                device.id === deviceId ? "border-ink text-ink font-semibold" : "border-stone-200 text-stone-600"
              }`}
            >
              {device.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
