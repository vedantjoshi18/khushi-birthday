"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

type Track = {
  id: string;
  name: string;
  uri: string;
  durationMs: number;
  album: { name: string; images: { url: string }[] };
  artists: { name: string }[];
};

type Props = {
  tracks: Track[];
  onPlay: (uri: string) => Promise<void>;
  onQueue: (uri: string, track: Track) => Promise<void>;
  onFavourite?: (track: Track) => void;
};

export default function TrackList({ tracks, onPlay, onQueue, onFavourite }: Readonly<Props>) {
  const [favedTrackId, setFavedTrackId] = useState<string | null>(null);

  const handleFavourite = (track: Track) => {
    onFavourite?.(track);
    setFavedTrackId(track.id);
    globalThis.setTimeout(() => {
      setFavedTrackId((current) => (current === track.id ? null : current));
    }, 900);
  };

  if (!tracks.length) {
    return <div className="rounded-2xl border border-stone-200 bg-white/60 p-4 text-sm text-stone-400">Search results will appear here.</div>;
  }

  return (
    <div className="space-y-2">
      {tracks.map((track) => (
        <div key={track.id} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white/70 p-3">
          <Image
            src={track.album.images[0]?.url || "/globe.svg"}
            alt={track.name}
            width={56}
            height={56}
            className="rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-stone-800">{track.name}</p>
            <p className="truncate text-xs text-stone-500">{track.artists.map((artist) => artist.name).join(", ")}</p>
          </div>
          <button onClick={() => onQueue(track.uri, track)} className="rounded-lg border border-stone-200 px-3 py-2 text-xs text-stone-600">
            Queue
          </button>
          <motion.button
            onClick={() => handleFavourite(track)}
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.94 }}
            animate={
              favedTrackId === track.id
                ? { scale: [1, 1.08, 1], boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 18px rgba(0,0,0,.15)", "0 0 0px rgba(0,0,0,0)"] }
                : { scale: 1 }
            }
            transition={{ duration: 0.4 }}
            className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-600"
          >
            {favedTrackId === track.id ? "Added 💖" : "Fav"}
          </motion.button>
          <button
            onClick={() => onPlay(track.uri)}
            className="rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white"
          >
            Play
          </button>
        </div>
      ))}
    </div>
  );
}
