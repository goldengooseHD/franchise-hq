# franchise-hq

## What This Is
Live Madden NFL franchise league dashboard. Receives data from Madden Companion App, stores in SQLite, serves a live dashboard for all league mates.

## League Info
- League: "The Showers"
- Platform: PS5, 10-person league
- Commissioner: Shane

## Stack
- **Backend**: Node.js + Express + better-sqlite3 (WAL mode)
- **Frontend**: Single-page app in public/index.html
- **Database**: SQLite at /data/franchise.db (Railway volume mount)
- **Deployment**: Railway (auto-deploys from GitHub push)
- **GitHub**: goldengooseHD/franchise-hq
- **Live URL**: https://franchise-hq-production.up.railway.app

## Critical Patterns
- Use schema version guard (SCHEMA_VERSION constant) — NOT piecemeal migrations
- Madden Companion App sends double-slash URLs — normalize in middleware
- Franchise mode uses long unique team IDs (775553054), NOT 0-32 indices — resolve via team_map table + abbrName fallback
- DB path: use /data/ if it exists (Railway volume), else local ./franchise.db

## UI Aesthetic
- "IB tech bro New York" — Bloomberg/fintech dark mode
- Fonts: Inter (body) + JetBrains Mono (data/numbers)
- Colors: pure black background, electric blue accents
- Auto-refresh every 30 seconds

## Data Sources
- Madden Companion App POST payloads: leagueTeamInfoList, teamStandingInfoList, gameScheduleInfoList, rosterInfoList, weekly stat lists
- Individual player stats are limited to overall ratings (not per-game yards/TDs)

## Roadmap
- Playoff bracket visualization
- Per-game box scores
- NCAA 26 dynasty mode version (no companion app exists — need to build data ingestion)
- Landing page for public launch
- Multi-league support for SaaS
