const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined;
const REDIRECT_URI =
  import.meta.env.VITE_SPOTIFY_REDIRECT_URI
  ?? "com.redwave.music://callback";
const SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-library-read",
  "user-read-recently-played",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-read-playback-state",
  "user-modify-playback-state"
];

const TOKEN_KEY = "redwave_spotify_token";
const EXPIRY_KEY = "redwave_spotify_expiry";
const VERIFIER_KEY = "redwave_pkce_verifier";

function base64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function randomString(length: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return base64Url(bytes);
}
async function sha256(value: string) {
  return await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
}

export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = Number(localStorage.getItem(EXPIRY_KEY) || 0);
  return token && Date.now() < expiry ? token : null;
}
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
  localStorage.removeItem(VERIFIER_KEY);
}
export function isConfigured() {
  return Boolean(CLIENT_ID);
}

export async function login() {
  if (!CLIENT_ID) throw new Error("Add VITE_SPOTIFY_CLIENT_ID to your .env file first.");
  const verifier = randomString(64);
  localStorage.setItem(VERIFIER_KEY, verifier);
  const challenge = base64Url(new Uint8Array(await sha256(verifier)));
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: challenge,
    scope: SCOPES.join(" ")
  });
  window.location.assign(`https://accounts.spotify.com/authorize?${params}`);
}

export async function completeLogin() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (error) throw new Error(`Spotify authorization failed: ${error}`);
  if (!code) return false;
  const verifier = localStorage.getItem(VERIFIER_KEY);
  if (!CLIENT_ID || !verifier) throw new Error("Missing OAuth configuration or PKCE verifier.");
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier
  });
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || "Token exchange failed.");
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(EXPIRY_KEY, String(Date.now() + data.expires_in * 1000));
  localStorage.removeItem(VERIFIER_KEY);
  window.history.replaceState({}, document.title, window.location.pathname);
  return true;
}

export async function spotify<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("Connect Spotify to continue.");
  const response = await fetch(`https://api.spotify.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers
    }
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || `Spotify API error (${response.status})`;
    throw new Error(message);
  }
  return data as T;
}

export type SpotifyTrack = {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
};

export async function getFeaturedTracks() {
  const data = await spotify<{ items: { track: SpotifyTrack }[] }>("/me/player/recently-played?limit=12");
  return data.items.map(item => item.track);
}
export async function getProfile() {
  return spotify<{ display_name: string; images: { url: string }[]; product?: string }>("/me");
}
export async function playTrack(uri: string) {
  return spotify<void>("/me/player/play", {
    method: "PUT",
    body: JSON.stringify({ uris: [uri] })
  });
}
export async function controlPlayback(action: "pause" | "next" | "previous") {
  const paths = {
    pause: ["/me/player/pause", "PUT"],
    next: ["/me/player/next", "POST"],
    previous: ["/me/player/previous", "POST"]
  } as const;
  const [path, method] = paths[action];
  return spotify<void>(path, { method });
}
