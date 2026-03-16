# Khushi Birthday Web App

A Next.js 14 + React + TypeScript birthday site with violet glassmorphism visuals, smooth scroll, interactive 3D background, Spotify player, video messages, and story sections.

## Stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Framer Motion
- Lenis smooth scroll
- Three.js + React Three Fiber + postprocessing
- GSAP ScrollTrigger
- Spotify Web Playback SDK + Spotify Web API (PKCE)

## Run

1. Install dependencies:
	```bash
	npm install
	```
2. Create `.env.local` from `.env.local.example`
3. Add your Spotify Client ID in `.env.local`
4. Start dev server:
	```bash
	npm run dev
	```

## Spotify Setup Guide (PKCE, no backend)

1. Open https://developer.spotify.com/dashboard
2. Create an app
3. Set Redirect URI to: `http://localhost:3000/callback`
4. Enable **Web Playback SDK** in app settings
5. Copy Client ID to `.env.local` as `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`
6. Use a Spotify Premium account for playback support

## Content Management

### Photos

- Put image files in `public/photos/`
- Update photo names in `components/sections/Hero.tsx` (`photoFiles` array)

### Videos + Friend Messages

- Put videos in `public/videos/`
- Put thumbnails in `public/thumbnails/`
- Edit friend entries in `data/friends.ts`

## Structure

- `app/layout.tsx` → global shell and fonts
- `components/ui/AppShell.tsx` → Lenis, navbar, cursor, background layer
- `components/three/Background.tsx` → particle + blob 3D scene
- `components/sections/*` → all page sections
- `components/spotify/*` → auth, provider, controls, search, list
- `app/callback/page.tsx` → Spotify PKCE callback exchange

## Notes

- Three.js particle count auto-reduces on mobile
- Custom cursor is hidden on touch devices
- Sections are stacked for scroll-only navigation
- Spotify section includes loading skeleton and error boundary fallback
