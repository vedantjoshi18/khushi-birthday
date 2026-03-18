"use client";

import GlassCard from "@/components/ui/GlassCard";
import SpotifyProvider, { useSpotify } from "@/components/spotify/SpotifyProvider";
import SearchBar from "@/components/spotify/SearchBar";
import TrackList from "@/components/spotify/TrackList";
import PlayerControls from "@/components/spotify/PlayerControls";
import SpotifyErrorBoundary from "./SpotifyErrorBoundary";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type SavedSong = {
  id: string;
  name: string;
  artist: string;
  uri?: string;
  note?: string;
};

type RemovedSongUndo = {
  list: "favourites" | "cutie";
  song: SavedSong;
  index: number;
};

export default function MusicPlayerSection() {
  return (
    <section id="music" className="min-h-screen px-4 py-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        <SpotifyErrorBoundary>
          <SpotifyProvider>
            <PlayerInner />
          </SpotifyProvider>
        </SpotifyErrorBoundary>
      </div>
    </section>
  );
}

function PlayerInner() {
  const {
    token,
    loading,
    connect,
    disconnect,
    playback,
    sdkReady,
    search,
    searchResults,
    playTrack,
    addToQueue,
    removeFromQueue,
    queue,
    recentlyPlayed,
  } = useSpotify();

  const [showMini, setShowMini] = useState(false);
  const [favourites, setFavourites] = useState<SavedSong[]>([]);
  const [cutieSpecial, setCutieSpecial] = useState<SavedSong[]>([]);
  const [songName, setSongName] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [songNote, setSongNote] = useState("");
  const [favAddedPulse, setFavAddedPulse] = useState(false);
  const [cutieAddedPulse, setCutieAddedPulse] = useState(false);
  const [removedSongUndo, setRemovedSongUndo] = useState<RemovedSongUndo | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);

  const openFullPlayer = () => {
    document.getElementById("music")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const currentSong = useMemo(() => {
    if (!playback.track) return null;
    return {
      id: playback.track.id,
      name: playback.track.name,
      artist: playback.track.artists.map((artist) => artist.name).join(", "),
      uri: playback.track.uri,
    } satisfies SavedSong;
  }, [playback.track]);

  useEffect(() => {
    const onScroll = () => {
      const section = document.getElementById("music");
      if (!section) return;
      const { bottom } = section.getBoundingClientRect();
      setShowMini(window.innerWidth < 768 && bottom < 120);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const favouritesRaw = localStorage.getItem("khushi_favourites");
    const cutieRaw = localStorage.getItem("khushi_cutie_special");

    if (favouritesRaw) {
      try {
        setFavourites(JSON.parse(favouritesRaw));
      } catch {
        setFavourites([]);
      }
    }

    if (cutieRaw) {
      try {
        setCutieSpecial(JSON.parse(cutieRaw));
      } catch {
        setCutieSpecial([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("khushi_favourites", JSON.stringify(favourites));
  }, [favourites]);

  useEffect(() => {
    localStorage.setItem("khushi_cutie_special", JSON.stringify(cutieSpecial));
  }, [cutieSpecial]);

  useEffect(() => {
    if (undoTimerRef.current) {
      globalThis.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }

    if (!removedSongUndo) return;

    undoTimerRef.current = globalThis.setTimeout(() => {
      setRemovedSongUndo(null);
      undoTimerRef.current = null;
    }, 5000);

    return () => {
      if (undoTimerRef.current) {
        globalThis.clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
    };
  }, [removedSongUndo]);

  const addFavourite = (song: SavedSong) => {
    setFavourites((items) => {
      const exists = items.some((item) => (item.uri ? item.uri === song.uri : item.name === song.name && item.artist === song.artist));
      if (exists) return items;
      return [{ ...song, id: song.id || crypto.randomUUID() }, ...items].slice(0, 40);
    });
    setFavAddedPulse(true);
    globalThis.setTimeout(() => setFavAddedPulse(false), 900);
  };

  const addCutieSong = (song: SavedSong) => {
    setCutieSpecial((items) => [{ ...song, id: song.id || crypto.randomUUID() }, ...items].slice(0, 60));
    setCutieAddedPulse(true);
    globalThis.setTimeout(() => setCutieAddedPulse(false), 900);
  };

  const removeFavourite = (songId: string) => {
    setFavourites((items) => {
      const index = items.findIndex((song) => song.id === songId);
      if (index === -1) return items;
      const song = items[index];
      const nextItems = [...items];
      nextItems.splice(index, 1);
      setRemovedSongUndo({ list: "favourites", song, index });
      return nextItems;
    });
  };

  const removeCutieSong = (songId: string) => {
    setCutieSpecial((items) => {
      const index = items.findIndex((song) => song.id === songId);
      if (index === -1) return items;
      const song = items[index];
      const nextItems = [...items];
      nextItems.splice(index, 1);
      setRemovedSongUndo({ list: "cutie", song, index });
      return nextItems;
    });
  };

  const undoRemove = () => {
    if (!removedSongUndo) return;

    if (removedSongUndo.list === "favourites") {
      setFavourites((items) => {
        if (items.some((song) => song.id === removedSongUndo.song.id)) return items;
        const nextItems = [...items];
        const safeIndex = Math.min(Math.max(removedSongUndo.index, 0), nextItems.length);
        nextItems.splice(safeIndex, 0, removedSongUndo.song);
        return nextItems;
      });
    } else {
      setCutieSpecial((items) => {
        if (items.some((song) => song.id === removedSongUndo.song.id)) return items;
        const nextItems = [...items];
        const safeIndex = Math.min(Math.max(removedSongUndo.index, 0), nextItems.length);
        nextItems.splice(safeIndex, 0, removedSongUndo.song);
        return nextItems;
      });
    }

    setRemovedSongUndo(null);
  };

  const submitCutieSong = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!songName.trim()) return;

    addCutieSong({
      id: crypto.randomUUID(),
      name: songName.trim(),
      artist: songArtist.trim() || "Unknown artist",
      note: songNote.trim() || "This song reminds me of you 💜",
    });

    setSongName("");
    setSongArtist("");
    setSongNote("");
  };

  if (loading) {
    return (
      <GlassCard className="p-8">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-stone-100" />
        <div className="mt-6 h-72 animate-pulse rounded-3xl bg-stone-50" />
      </GlassCard>
    );
  }

  if (!token) {
    return (
      <GlassCard className="p-10 text-center">
        <h2 className="text-3xl font-bold text-stone-800">Our Soundtrack</h2>
        <p className="mx-auto mt-4 max-w-xl text-stone-500">
          Connect Spotify to unlock full playback, search, queue, and device controls. Spotify Premium is required for Web Playback.
        </p>
        <button
          onClick={connect}
          className="mt-8 rounded-2xl bg-ink px-7 py-3 font-semibold text-white shadow-[0_0_24px_rgba(0,0,0,.2)]"
        >
          Connect Spotify
        </button>
      </GlassCard>
    );
  }

  const image = playback.track?.album.images[0]?.url || "/globe.svg";

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <GlassCard className="p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-stone-500">{sdkReady ? "SDK Connected" : "Connecting Web Playback SDK..."}</div>
            <button onClick={disconnect} className="text-xs text-stone-400 underline underline-offset-4">
              Disconnect
            </button>
          </div>

          <div className="mx-auto w-fit">
            <motion.div
              animate={playback.isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={playback.isPlaying ? { repeat: Number.POSITIVE_INFINITY, ease: "linear", duration: 10 } : { duration: 0.4 }}
              className="relative h-56 w-56 overflow-hidden rounded-full border border-stone-200/50"
              style={{ boxShadow: "0 0 32px rgba(0,0,0,.1)" }}
            >
              <Image src={image} alt="album art" fill className="object-cover" />
            </motion.div>
          </div>

          <div className="mt-6 text-center">
            <h3 className="truncate text-2xl font-bold text-stone-800">{playback.track?.name || "Pick a song"}</h3>
            <p className="mt-1 text-stone-500">{playback.track?.artists.map((artist) => artist.name).join(", ") || ""}</p>
            <p className="text-sm text-stone-400">{playback.track?.album.name || ""}</p>
            {currentSong && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <motion.button
                  onClick={() => addFavourite(currentSong)}
                  whileHover={{ scale: 1.06, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={favAddedPulse ? { scale: [1, 1.08, 1], boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 20px rgba(0,0,0,.15)", "0 0 0px rgba(0,0,0,0)"] } : { scale: 1 }}
                  transition={{ duration: 0.45 }}
                  className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-600"
                >
                  {favAddedPulse ? "Added 💖" : "+ Favourite"}
                </motion.button>
                <motion.button
                  onClick={() =>
                    addCutieSong({
                      ...currentSong,
                      note: "This one reminds me of you ✨",
                    })
                  }
                  whileHover={{ scale: 1.06, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={cutieAddedPulse ? { scale: [1, 1.08, 1], boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 20px rgba(0,0,0,.15)", "0 0 0px rgba(0,0,0,0)"] } : { scale: 1 }}
                  transition={{ duration: 0.45 }}
                  className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-600"
                >
                  {cutieAddedPulse ? "So Cute ✨" : "+ Cutie Special"}
                </motion.button>
              </div>
            )}
          </div>

          <div className="mt-6">
            <PlayerControls />
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-4">
            <SearchBar onSearch={search} />
            <div className="mt-4 max-h-72 overflow-y-auto pr-1">
              <TrackList
                tracks={searchResults}
                onPlay={playTrack}
                onQueue={addToQueue}
                onFavourite={(track) =>
                  addFavourite({
                    id: track.id,
                    name: track.name,
                    artist: track.artists.map((artist) => artist.name).join(", "),
                    uri: track.uri,
                  })
                }
              />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <h4 className="mb-3 text-sm font-semibold text-stone-600">Play Next Queue</h4>
            <ul className="space-y-2 text-sm text-stone-600">
              {queue.length ? (
                queue.map((track, index) => (
                  <li key={`${track.id}-${track.uri}-${index}`} className="flex items-center justify-between gap-2 rounded-lg bg-white/70 px-3 py-2">
                    <p className="min-w-0 truncate">{track.name} · {track.artists.map((artist) => artist.name).join(", ")}</p>
                    <button
                      onClick={() => removeFromQueue(index)}
                      className="shrink-0 rounded-md border border-stone-200 px-2 py-1 text-[11px] text-stone-500 transition-colors hover:bg-stone-100"
                    >
                      Remove
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-stone-400">No queued tracks yet.</li>
              )}
            </ul>
          </GlassCard>

          <GlassCard className="p-4">
            <h4 className="mb-3 text-sm font-semibold text-stone-600">Recently Played</h4>
            <ul className="space-y-2 text-sm text-stone-600">
              {recentlyPlayed.length ? (
                recentlyPlayed.slice(0, 5).map((track) => (
                  <li key={track.id} className="truncate rounded-lg bg-white/70 px-3 py-2">
                    {track.name} · {track.artists.map((artist) => artist.name).join(", ")}
                  </li>
                ))
              ) : (
                <li className="text-stone-400">No recent tracks yet.</li>
              )}
            </ul>
          </GlassCard>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-stone-800">Favourites</h4>
            <span className="text-xs text-stone-400">Liked songs</span>
          </div>
          <ul className="max-h-64 space-y-2 overflow-y-auto pr-1 text-sm text-stone-600">
            {favourites.length ? (
              favourites.map((song) => (
                <li key={song.id} className="flex items-start justify-between gap-2 rounded-lg bg-white/70 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{song.name}</p>
                    <p className="truncate text-xs text-stone-500">{song.artist}</p>
                  </div>
                  <button
                    onClick={() => removeFavourite(song.id)}
                    className="shrink-0 rounded-md border border-stone-200 px-2 py-1 text-[11px] text-stone-500 transition-colors hover:bg-stone-50"
                  >
                    Remove
                  </button>
                </li>
              ))
            ) : (
              <li className="text-stone-400">No favourites yet. Add from current track or search.</li>
            )}
          </ul>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-stone-800">Cutie Special</h4>
            <span className="text-xs text-stone-400">Songs that remind her of you</span>
          </div>

          <form onSubmit={submitCutieSong} className="space-y-2">
            <input
              value={songName}
              onChange={(event) => setSongName(event.target.value)}
              placeholder="Song name"
              className="w-full rounded-lg border border-stone-200 bg-white/80 px-3 py-2 text-sm text-stone-700 outline-none placeholder:text-stone-400"
            />
            <input
              value={songArtist}
              onChange={(event) => setSongArtist(event.target.value)}
              placeholder="Artist"
              className="w-full rounded-lg border border-stone-200 bg-white/80 px-3 py-2 text-sm text-stone-700 outline-none placeholder:text-stone-400"
            />
            <input
              value={songNote}
              onChange={(event) => setSongNote(event.target.value)}
              placeholder="Why this reminds me of you"
              className="w-full rounded-lg border border-stone-200 bg-white/80 px-3 py-2 text-sm text-stone-700 outline-none placeholder:text-stone-400"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Add Song ✨
            </button>
          </form>

          <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1 text-sm text-stone-600">
            {cutieSpecial.length ? (
              cutieSpecial.map((song) => (
                <li key={song.id} className="flex items-start justify-between gap-2 rounded-lg bg-white/70 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{song.name}</p>
                    <p className="truncate text-xs text-stone-500">{song.artist}</p>
                    {song.note && <p className="truncate text-[11px] text-stone-500">{song.note}</p>}
                  </div>
                  <button
                    onClick={() => removeCutieSong(song.id)}
                    className="shrink-0 rounded-md border border-stone-200 px-2 py-1 text-[11px] text-stone-500 transition-colors hover:bg-stone-100"
                  >
                    Remove
                  </button>
                </li>
              ))
            ) : (
              <li className="text-stone-400">No songs yet. Add your first special memory song.</li>
            )}
          </ul>
        </GlassCard>
      </div>

      {showMini && (
        <div className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-stone-200 bg-white/90 p-3 backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-lg">
              <Image src={image} alt="mini album" width={40} height={40} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-stone-800">{playback.track?.name || "Not playing"}</p>
              <p className="truncate text-xs text-stone-500">{playback.track?.artists.map((artist) => artist.name).join(", ") || "Spotify"}</p>
            </div>
            <button onClick={openFullPlayer} className="rounded-lg bg-ink px-3 py-2 text-xs text-white">
              Open
            </button>
          </div>
        </div>
      )}

      {removedSongUndo && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          className="fixed bottom-20 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border border-stone-200 bg-white/90 p-3 text-sm backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-stone-700">
              Removed from {removedSongUndo.list === "favourites" ? "Favourites" : "Cutie Special"} 💫
            </p>
            <button
              onClick={undoRemove}
              className="shrink-0 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              Undo
            </button>
          </div>
          <p className="mt-1 truncate text-xs text-stone-500">{removedSongUndo.song.name}</p>
        </motion.div>
      )}
    </>
  );
}
