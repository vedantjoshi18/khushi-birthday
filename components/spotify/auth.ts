const SPOTIFY_AUTH = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN = "https://accounts.spotify.com/api/token";
const TOKEN_KEY = "khushi_spotify_token";
const VERIFIER_KEY = "khushi_spotify_verifier";

export type StoredToken = {
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
};

function persistStoredToken(token: StoredToken) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
}

export function resolveSpotifyRedirectUri() {
  const configured = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI?.trim();
  if (configured) return configured;
  if (globalThis.window !== undefined) return `${globalThis.window.location.origin}/callback`;
  return "http://localhost:3000/callback";
}

function randomString(length: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let value = "";
  for (let i = 0; i < length; i++) {
    value += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return value;
}

async function challengeFromVerifier(verifier: string) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCodePoint(...new Uint8Array(digest)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export async function startSpotifyLogin(clientId: string, redirectUri: string) {
  const verifier = randomString(128);
  const challenge = await challengeFromVerifier(verifier);
  localStorage.setItem(VERIFIER_KEY, verifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope:
      "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played user-read-playback-position",
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  globalThis.window.location.href = `${SPOTIFY_AUTH}?${params.toString()}`;
}

export async function exchangeCodeForToken(clientId: string, code: string, redirectUri: string) {
  const verifier = localStorage.getItem(VERIFIER_KEY);
  if (!verifier) throw new Error("Missing PKCE verifier. Start login again.");

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const response = await fetch(SPOTIFY_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || "Spotify token exchange failed");
  }

  const token: StoredToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    refreshToken: data.refresh_token,
  };

  persistStoredToken(token);
  localStorage.removeItem(VERIFIER_KEY);
  return token;
}

export async function refreshSpotifyToken(clientId: string, refreshToken: string) {
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(SPOTIFY_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || "Spotify token refresh failed");
  }

  const token: StoredToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    refreshToken: data.refresh_token || refreshToken,
  };

  persistStoredToken(token);
  return token;
}

export function getStoredToken() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredToken;
  } catch {
    return null;
  }
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}
