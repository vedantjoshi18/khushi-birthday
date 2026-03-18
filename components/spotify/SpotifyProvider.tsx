"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  clearStoredToken,
  getStoredToken,
  refreshSpotifyToken,
  resolveSpotifyRedirectUri,
  startSpotifyLogin,
} from "./auth";

declare global {
  interface Window {
    Spotify?: {
      Player: new (config: {
        name: string;
        getOAuthToken: (callback: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayer;
    };
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

type SpotifyPlayer = {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback?: (...args: any[]) => void) => void;
  getCurrentState: () => Promise<any>;
  togglePlay: () => Promise<void>;
};

type Track = {
  id: string;
  name: string;
  uri: string;
  durationMs: number;
  album: { name: string; images: { url: string }[] };
  artists: { name: string; id?: string }[];
};

type PlaybackState = {
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
  track: Track | null;
  shuffle: boolean;
  repeatState: "off" | "context" | "track";
};

type Device = {
  id: string;
  name: string;
  is_active: boolean;
  type: string;
};

type SpotifyContextValue = {
  token: string | null;
  playback: PlaybackState;
  searchResults: Track[];
  recentlyPlayed: Track[];
  devices: Device[];
  queue: Track[];
  loading: boolean;
  sdkReady: boolean;
  deviceId: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  search: (query: string) => Promise<void>;
  playTrack: (uri: string) => Promise<void>;
  togglePlay: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (volumePercent: number) => Promise<void>;
  setShuffle: (state: boolean) => Promise<void>;
  cycleRepeat: () => Promise<void>;
  addToQueue: (uri: string, track?: Track) => Promise<void>;
  removeFromQueue: (index: number) => void;
  loadDevices: () => Promise<void>;
  transferPlayback: (id: string) => Promise<void>;
};

const SpotifyContext = createContext<SpotifyContextValue | null>(null);

const initialPlayback: PlaybackState = {
  isPlaying: false,
  progressMs: 0,
  durationMs: 0,
  track: null,
  shuffle: false,
  repeatState: "off",
};

const SPOTIFY_API = "https://api.spotify.com/v1";

function normalizeTrack(raw: any): Track {
  return {
    id: raw?.id || crypto.randomUUID(),
    name: raw?.name || "Unknown",
    uri: raw?.uri || "",
    durationMs: raw?.duration_ms || 0,
    album: raw?.album || { name: "", images: [] },
    artists: raw?.artists || [],
  };
}

function uniqueTracks(items: Track[]) {
  const seen = new Set<string>();
  const result: Track[] = [];
  for (const item of items) {
    const key = item.uri || item.id;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function repeatStateFromMode(repeatMode: number): PlaybackState["repeatState"] {
  if (repeatMode === 2) return "track";
  if (repeatMode === 1) return "context";
  return "off";
}

function trackFromPlayerState(currentTrack: any): Track | null {
  if (!currentTrack) return null;

  return {
    id: currentTrack.id,
    name: currentTrack.name,
    uri: currentTrack.uri,
    durationMs: currentTrack.duration_ms,
    album: currentTrack.album,
    artists: currentTrack.artists,
  };
}

export default function SpotifyProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [playback, setPlayback] = useState(initialPlayback);
  const [devices, setDevices] = useState<Device[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const tokenRef = useRef<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const refreshAccessToken = useCallback(async () => {
    if (!clientId) return null;

    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const stored = getStoredToken();
    if (!stored?.refreshToken) {
      clearStoredToken();
      setToken(null);
      return null;
    }

    refreshPromiseRef.current = refreshSpotifyToken(clientId, stored.refreshToken)
      .then((nextToken) => {
        setToken(nextToken.accessToken);
        return nextToken.accessToken;
      })
      .catch(() => {
        clearStoredToken();
        setToken(null);
        return null;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    return refreshPromiseRef.current;
  }, [clientId]);

  const api = useCallback(
    async (path: string, init?: RequestInit) => {
      if (!tokenRef.current) throw new Error("Spotify not connected");

      const runRequest = async (accessToken: string) => {
        const headers = new Headers(init?.headers);
        headers.set("Authorization", `Bearer ${accessToken}`);
        if (init?.body && !headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }

        const response = await fetch(`${SPOTIFY_API}${path}`, {
          ...init,
          headers,
        });

        if (response.status === 204) {
          return { response, data: null };
        }

        const data = await response.json().catch(() => null);
        return { response, data };
      };

      let { response, data } = await runRequest(tokenRef.current);

      if (response.status === 401) {
        const nextToken = await refreshAccessToken();
        if (!nextToken) return null;
        ({ response, data } = await runRequest(nextToken));
      }

      if (!response.ok) {
        const errorMessage = data?.error?.message || "Spotify API error";
        console.error(`Spotify API error on ${path}: ${errorMessage}`);
        return null;
      }

      return data;
    },
    [refreshAccessToken]
  );

  const withDevice = useCallback(
    (path: string) => {
      if (!deviceId) return path;
      const separator = path.includes("?") ? "&" : "?";
      return `${path}${separator}device_id=${encodeURIComponent(deviceId)}`;
    },
    [deviceId]
  );

  const loadPlayback = useCallback(async () => {
    if (!token) return;
    const current = await api("/me/player");
    if (!current) return;

    setPlayback({
      isPlaying: current.is_playing,
      progressMs: current.progress_ms || 0,
      durationMs: current.item?.duration_ms || 0,
      track: current.item ? normalizeTrack(current.item) : null,
      shuffle: current.shuffle_state,
      repeatState: current.repeat_state,
    });
  }, [api, token]);

  const syncPlaybackSoon = useCallback(() => {
    if (syncTimerRef.current) {
      globalThis.clearTimeout(syncTimerRef.current);
    }
    syncTimerRef.current = globalThis.setTimeout(() => {
      loadPlayback().catch(() => null);
    }, 120);
  }, [loadPlayback]);

  const loadRecent = useCallback(async () => {
    if (!token) return;
    const data = await api("/me/player/recently-played?limit=8");
    const tracks = uniqueTracks((data?.items || []).map((item: any) => normalizeTrack(item.track)));
    setRecentlyPlayed(tracks);
  }, [api, token]);

  const loadDevices = useCallback(async () => {
    if (!token) return;
    const data = await api("/me/player/devices");
    setDevices(data?.devices || []);
  }, [api, token]);

  const transferPlayback = useCallback(
    async (id: string) => {
      await api("/me/player", {
        method: "PUT",
        body: JSON.stringify({ device_ids: [id], play: false }),
      });
      setDeviceId(id);
      await loadDevices();
    },
    [api, loadDevices]
  );

  const connect = useCallback(async () => {
    if (!clientId) {
      alert("Set NEXT_PUBLIC_SPOTIFY_CLIENT_ID in .env.local first.");
      return;
    }
    await startSpotifyLogin(clientId, resolveSpotifyRedirectUri());
  }, [clientId]);

  const disconnect = useCallback(() => {
    playerRef.current?.disconnect();
    playerRef.current = null;
    clearStoredToken();
    setToken(null);
    setSdkReady(false);
    setDeviceId(null);
    setPlayback(initialPlayback);
    setSearchResults([]);
    setRecentlyPlayed([]);
    setQueue([]);
    setDevices([]);
  }, []);

  useEffect(() => {
    const stored = getStoredToken();
    if (!stored?.accessToken) {
      setLoading(false);
      return;
    }

    if (Date.now() >= stored.expiresAt - 60_000 && stored.refreshToken && clientId) {
      refreshAccessToken().finally(() => setLoading(false));
      return;
    }

    setToken(stored.accessToken);
    setLoading(false);
  }, [clientId, refreshAccessToken]);

  useEffect(() => {
    if (!token) return;

    const initializePlayer = () => {
      if (!globalThis.window.Spotify || playerRef.current) return;

      const instance = new globalThis.window.Spotify.Player({
        name: "Khushi Birthday Player",
        getOAuthToken: (callback) => callback(tokenRef.current || ""),
        volume: 0.7,
      });

      const handleReady = ({ device_id }: { device_id: string }) => {
        setSdkReady(true);
        setDeviceId(device_id);
        void transferPlayback(device_id);
      };

      const handleNotReady = () => {
        setSdkReady(false);
      };

      const handlePlayerStateChanged = (state: any) => {
        if (!state) return;

        const track = trackFromPlayerState(state.track_window?.current_track);

        setPlayback({
          isPlaying: !state.paused,
          progressMs: state.position || 0,
          durationMs: state.duration || track?.durationMs || 0,
          track,
          shuffle: Boolean(state.shuffle),
          repeatState: repeatStateFromMode(state.repeat_mode),
        });
      };

      instance.addListener("ready", handleReady);
      instance.addListener("not_ready", handleNotReady);
      instance.addListener("player_state_changed", handlePlayerStateChanged);

      playerRef.current = instance;
      void instance.connect();
    };

    if (globalThis.window.Spotify) {
      initializePlayer();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://sdk.scdn.co/spotify-player.js"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    }

    globalThis.window.onSpotifyWebPlaybackSDKReady = initializePlayer;

    return () => {
      globalThis.window.onSpotifyWebPlaybackSDKReady = undefined;
    };
  }, [token, transferPlayback]);

  useEffect(() => {
    if (!token) return;
    loadPlayback().catch(() => null);
    loadRecent().catch(() => null);
    loadDevices().catch(() => null);

    const timer = setInterval(() => {
      loadPlayback().catch(() => null);
    }, playback.isPlaying ? 1200 : 3000);

    return () => clearInterval(timer);
  }, [loadDevices, loadPlayback, loadRecent, playback.isPlaying, token]);

  useEffect(() => {
    if (!playback.isPlaying || !playback.durationMs) return;

    let lastTick = Date.now();
    const timer = globalThis.setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTick;
      lastTick = now;
      setPlayback((value) => ({
        ...value,
        progressMs: Math.min(value.progressMs + elapsed, value.durationMs),
      }));
    }, 250);

    return () => globalThis.clearInterval(timer);
  }, [playback.isPlaying, playback.durationMs]);

  useEffect(() => {
    return () => {
      if (syncTimerRef.current) {
        globalThis.clearTimeout(syncTimerRef.current);
      }
      searchAbortRef.current?.abort();
    };
  }, []);

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        searchAbortRef.current?.abort();
        setSearchResults([]);
        return;
      }

      searchAbortRef.current?.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;

      let data: any;
      try {
        data = await api(`/search?type=track&limit=10&q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setSearchResults([]);
        return;
      }

      if (controller.signal.aborted) return;

      if (!data?.tracks?.items) {
        setSearchResults([]);
        return;
      }
      setSearchResults((data?.tracks?.items || []).map((item: any) => normalizeTrack(item)));
    },
    [api]
  );

  const playTrack = useCallback(
    async (uri: string) => {
      setPlayback((value) => ({ ...value, isPlaying: true, progressMs: 0 }));
      globalThis.dispatchEvent(new CustomEvent("teddy:music"));
      await api(withDevice("/me/player/play"), { method: "PUT", body: JSON.stringify({ uris: [uri] }) });
      syncPlaybackSoon();
    },
    [api, syncPlaybackSoon, withDevice]
  );

  const playNextFromLocalQueue = useCallback(async () => {
    let nextTrackItem: Track | undefined;
    setQueue((value) => {
      if (!value.length) return value;
      const [next, ...rest] = value;
      nextTrackItem = next;
      return rest;
    });

    if (!nextTrackItem?.uri) {
      return false;
    }

    await playTrack(nextTrackItem.uri);
    return true;
  }, [playTrack]);

  const togglePlay = useCallback(async () => {
    const nextPlaying = !playback.isPlaying;
    setPlayback((value) => ({ ...value, isPlaying: nextPlaying }));

    if (playerRef.current) {
      await playerRef.current.togglePlay();
      syncPlaybackSoon();
      return;
    }

    if (playback.isPlaying) {
      await api(withDevice("/me/player/pause"), { method: "PUT" });
    } else {
      await api(withDevice("/me/player/play"), { method: "PUT" });
    }
    syncPlaybackSoon();
  }, [api, playback.isPlaying, syncPlaybackSoon, withDevice]);

  const nextTrack = useCallback(async () => {
    const handledByLocalQueue = await playNextFromLocalQueue();
    if (handledByLocalQueue) return;

    await api(withDevice("/me/player/next"), { method: "POST" });
    syncPlaybackSoon();
  }, [api, playNextFromLocalQueue, syncPlaybackSoon, withDevice]);

  const previousTrack = useCallback(async () => {
    await api(withDevice("/me/player/previous"), { method: "POST" });
    syncPlaybackSoon();
  }, [api, syncPlaybackSoon, withDevice]);

  const seek = useCallback(
    async (positionMs: number) => {
      const target = Math.max(0, Math.floor(positionMs));
      setPlayback((value) => ({ ...value, progressMs: target }));
      await api(withDevice(`/me/player/seek?position_ms=${target}`), { method: "PUT" });
      syncPlaybackSoon();
    },
    [api, syncPlaybackSoon, withDevice]
  );

  const setVolume = useCallback(
    async (volumePercent: number) => {
      await api(withDevice(`/me/player/volume?volume_percent=${Math.max(0, Math.min(100, Math.floor(volumePercent)))}`), {
        method: "PUT",
      });
    },
    [api, withDevice]
  );

  const setShuffle = useCallback(
    async (state: boolean) => {
      setPlayback((value) => ({ ...value, shuffle: state }));
      await api(withDevice(`/me/player/shuffle?state=${state}`), { method: "PUT" });
      syncPlaybackSoon();
    },
    [api, syncPlaybackSoon, withDevice]
  );

  const cycleRepeat = useCallback(async () => {
    let next: PlaybackState["repeatState"] = "off";
    if (playback.repeatState === "off") {
      next = "context";
    } else if (playback.repeatState === "context") {
      next = "track";
    }
    setPlayback((value) => ({ ...value, repeatState: next }));
    await api(withDevice(`/me/player/repeat?state=${next}`), { method: "PUT" });
    syncPlaybackSoon();
  }, [api, playback.repeatState, syncPlaybackSoon, withDevice]);

  const addToQueue = useCallback(async (_uri: string, track?: Track) => {
    if (!track) return;
    setQueue((value) => [...value, track].slice(-30));
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((value) => value.filter((_, trackIndex) => trackIndex !== index));
  }, []);

  const value = useMemo<SpotifyContextValue>(
    () => ({
      token,
      playback,
      searchResults,
      recentlyPlayed,
      devices,
      queue,
      loading,
      sdkReady,
      deviceId,
      connect,
      disconnect,
      search,
      playTrack,
      togglePlay,
      nextTrack,
      previousTrack,
      seek,
      setVolume,
      setShuffle,
      cycleRepeat,
      addToQueue,
      removeFromQueue,
      loadDevices,
      transferPlayback,
    }),
    [
      token,
      playback,
      searchResults,
      recentlyPlayed,
      devices,
      queue,
      loading,
      sdkReady,
      deviceId,
      connect,
      disconnect,
      search,
      playTrack,
      togglePlay,
      nextTrack,
      previousTrack,
      seek,
      setVolume,
      setShuffle,
      cycleRepeat,
      addToQueue,
      removeFromQueue,
      loadDevices,
      transferPlayback,
    ]
  );

  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
}

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error("useSpotify must be used within SpotifyProvider");
  }
  return context;
}
