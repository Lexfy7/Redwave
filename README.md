# Redwave

A community-built, glass-inspired music client starter. Redwave is an independent project and is not affiliated with Spotify.

![Redwave preview](https://placehold.co/1200x650/111018/ff6b83?text=Redwave+Music+Client)

## Features

- Liquid-glass inspired responsive interface
- Spotify OAuth Authorization Code with PKCE (no client secret in the browser)
- Recent listening, profile display, and playback-control integration
- Local demo mode when Spotify credentials are not configured
- Search within loaded tracks
- Privacy-minded architecture and accessible reduced-motion support

## Important playback and advertising notes

Redwave does **not** remove, skip, or interfere with Spotify advertisements, subscription checks, or platform controls. It is not an ad-free Spotify client. The Spotify Web API and playback endpoints are subject to Spotify's current developer terms, eligibility rules, rate limits, and account requirements. Some playback actions require Spotify Premium and an active Spotify playback device.

The "Privacy mode" label in this starter is a UI concept, not a claim that network requests are blocked. If you add a tracker/content blocker, implement it as a transparent, user-configurable filter for your own app's optional analytics and third-party embeds. Do not intercept Spotify traffic or modify Spotify's advertising.

## Quick start

Requirements: Node.js 20+ and npm.

```bash
git clone https://github.com/YOUR_USERNAME/redwave.git
cd redwave
npm install
cp .env.example .env
```

Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard), then set:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
```

Add exactly the same redirect URI to your Spotify app settings. Start the app:

```bash
npm run dev
```

Open the local URL printed by Vite. Use **Connect Spotify** to authorize.

> Never put a Spotify client secret in a frontend `.env` file. This app uses PKCE and a public client ID.

## Build

```bash
npm run build
npm run preview
```

## Project structure

```text
redwave/
├── src/
│   ├── App.tsx       # Main UI and app state
│   ├── main.tsx      # React entry
│   ├── spotify.ts    # PKCE auth and Spotify API helpers
│   └── styles.css    # Liquid-glass design system
├── .env.example
├── index.html
├── package.json
└── README.md
```

## Roadmap

- [ ] Persistent playlist/library views
- [ ] Device picker and current playback state polling
- [ ] Keyboard shortcuts and command palette
- [ ] User-controlled privacy filters for optional third-party embeds
- [ ] Unit and end-to-end tests
- [ ] Internationalization
- [ ] Desktop packaging (Tauri)

## Contributing

Issues and pull requests are welcome. Please include reproduction steps for bugs and screenshots for visual changes. Keep changes small, document new environment variables, and never commit secrets.

## License

MIT — see [LICENSE](LICENSE).

## Trademark

Spotify is a trademark of Spotify AB. Redwave is an independent community project and is not endorsed by or affiliated with Spotify.


## Android APK (GitHub Actions)

This repository includes a GitHub Actions workflow that builds a **debug APK** automatically.

1. Push the project to a GitHub repository on the `main` or `master` branch.
2. Open the repository's **Actions** tab.
3. Select **Build Android APK** and wait for the workflow to finish.
4. Open the completed run and download the `redwave-android-apk` artifact.
5. Extract the ZIP artifact to get `redwave-debug.apk`.

To publish an APK under **Releases**, create and push a version tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The workflow attaches the debug APK to the GitHub Release. A debug APK is suitable for testing, not a final Play Store release. For public distribution, create a separately signed release build and keep signing keys in GitHub Actions Secrets—never commit keystores or passwords.

### Android development locally

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

The first `cap add android` creates the native Android project. Commit the generated `android/` folder if you want to edit it directly and build it locally in Android Studio.
