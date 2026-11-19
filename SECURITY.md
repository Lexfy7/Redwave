# Security policy

Please do not publish access tokens, credentials, or exploitable details in public issues. For sensitive reports, contact the repository maintainers privately.

Redwave uses Spotify's PKCE authorization flow. Treat browser storage as accessible to scripts running in the same origin; do not add untrusted scripts or third-party analytics without review. Never add a Spotify client secret to frontend code.
