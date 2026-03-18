"use client";

import { exchangeCodeForToken, resolveSpotifyRedirectUri } from "@/components/spotify/auth";
import { useEffect, useState } from "react";

export default function CallbackPage() {
  const [message, setMessage] = useState("Connecting Spotify...");

  useEffect(() => {
    const run = async () => {
      const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";
      const params = new URLSearchParams(globalThis.window.location.search);
      const code = params.get("code");
      const error = params.get("error");

      if (error) {
        setMessage(`Spotify authorization failed: ${error}`);
        return;
      }

      if (!clientId || !code) {
        setMessage("Missing Spotify configuration. Check NEXT_PUBLIC_SPOTIFY_CLIENT_ID.");
        return;
      }

      try {
        await exchangeCodeForToken(clientId, code, resolveSpotifyRedirectUri());
        globalThis.window.location.href = "/#music";
      } catch (err) {
        const reason = err instanceof Error ? err.message : "Unknown error";
        setMessage(`Spotify connection failed: ${reason}`);
      }
    };

    run();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0a1a] px-6 text-center text-white">
      <div className="rounded-3xl border border-violet-400/20 bg-white/5 p-8 backdrop-blur-xl">
        <p className="text-lg">{message}</p>
      </div>
    </div>
  );
}
