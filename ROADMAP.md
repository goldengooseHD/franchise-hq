# Franchise HQ -- Productization Roadmap

**Project**: Franchise HQ — Live Madden NFL Franchise League Dashboard
**Owner**: Shane (Commissioner, non-technical founder)
**Stack**: Node.js + Express + SQLite, deployed on Railway
**Live**: https://franchise-hq-production.up.railway.app
**Repo**: github.com/goldengooseHD/franchise-hq
**Current State**: Working single-league dashboard for "The Showers" (PS5, 10 players). Standings, scores/matchups, rosters, team stats all functional. Data ingested from Madden Companion App.

---

## How to Use This Roadmap

Each phase below is written so Shane can hand it directly to Claude as a prompt. Copy the phase, paste it into a Claude session with the codebase loaded, and say "Do this." Each task has a clear definition of done.

---

## Phase 1: Polish for Public Launch

**Timeline**: 1-2 weeks
**Goal**: Make franchise-hq ready for other commissioners to use, not just The Showers.

### 1.1 Playoff Bracket Visualization

**What**: Build a visual playoff bracket on the dashboard that auto-populates from schedule/standings data once the regular season ends.

**Prompt for Claude**:
> Add a playoff bracket tab to the dashboard. Use the existing gameScheduleInfoList data to detect playoff weeks (weekIndex >= 19 in a typical Madden season). Render a standard NFL-style bracket: 7 seeds per conference, Wild Card -> Divisional -> Conference Championship -> Super Bowl. If playoff data hasn't been pushed yet, show the projected seedings based on current standings. Match the existing dark mode aesthetic -- black background, electric blue accent lines connecting matchups, Inter font for team names, JetBrains Mono for scores. Make it responsive so it looks good on mobile too.

**Definition of Done**:
- New "Playoffs" tab on the dashboard
- Bracket renders from real data when available, projected seeds when not
- Clicking a matchup shows the score if the game is complete
- Works on mobile screens (stacked/scrollable if needed)

---

### 1.2 Multi-League Support

**What**: Right now the app is hardcoded to one league. Refactor so multiple commissioners can each have their own isolated league with its own data.

**Prompt for Claude**:
> Refactor franchise-hq for multi-league support. Each league needs a unique slug (e.g., "the-showers") that scopes all data. Changes needed:
> 1. Add a `leagues` table: id, slug, name, platform, created_at. Generate slugs from league name.
> 2. Add a `league_id` foreign key to every existing table (standings, rosters, schedules, team_map, etc.).
> 3. Update all Companion App webhook endpoints to accept a league slug in the URL path, e.g., POST /api/:leagueSlug/leagueteams. This way each commissioner configures their Companion App to point to their unique URL.
> 4. Update all frontend API calls to include the league slug. The dashboard URL becomes /:leagueSlug (e.g., /the-showers).
> 5. Add a league creation flow: POST /api/leagues { name, platform } that returns the slug and webhook URLs the commissioner needs.
> 6. Migrate existing data into a default "the-showers" league so nothing breaks.
> 7. Update SCHEMA_VERSION and the schema version guard per CLAUDE.md conventions.

**Definition of Done**:
- Multiple leagues can coexist in one database
- Each league's Companion App points to its own scoped webhook URLs
- Dashboard URL is /:leagueSlug
- Existing "The Showers" data is preserved under /the-showers
- No data leaks between leagues

---

### 1.3 Landing / Marketing Page

**What**: When someone hits the root URL (/) with no league selected, show a marketing page that explains what Franchise HQ is and lets commissioners sign up.

**Prompt for Claude**:
> Build a landing page at the root route (/) for franchise-hq. This is what people see before they have a league. Design:
> - Hero section: "Franchise HQ" in large Inter bold, tagline "The live dashboard your Madden league deserves." Electric blue gradient text on black.
> - 3-feature grid: Standings & Scores, Rosters & Stats, Playoff Brackets. Use simple icons or emoji placeholders.
> - "Start Your League" CTA button -- for now, link to a simple form that collects league name + commissioner email (store in a `waitlist` table, no actual league creation yet -- or wire it to the league creation endpoint from 1.2 if that's done).
> - Footer: "Built by Shane. Open source on GitHub." with repo link.
> - Same aesthetic as the dashboard: pure black, electric blue accents, Inter + JetBrains Mono.
> - Make sure existing league routes (/:leagueSlug) still work.

**Definition of Done**:
- Root URL shows the landing page
- CTA either creates a league or adds to waitlist
- Looks polished on desktop and mobile
- Does not interfere with existing league dashboard routes

---

### 1.4 Commissioner Setup Guide

**What**: Clean up and expand the Setup tab so any commissioner can self-serve onboarding without messaging Shane.

**Prompt for Claude**:
> Rewrite the Setup tab content in the dashboard. It should be a step-by-step guide that covers:
> 1. What Franchise HQ is (one sentence).
> 2. Prerequisites: Madden 25 (or later), a console with the Madden Companion App installed on a phone/tablet.
> 3. How to create a league on Franchise HQ (hit the API or use the landing page form).
> 4. How to configure the Companion App: exact URL to enter, which export buttons to tap, what data gets sent.
> 5. Troubleshooting: "I exported but nothing shows up" -- check the URL, check the league slug, check that the export completed.
> 6. Include the league-specific webhook URLs dynamically (pull from the current league slug).
> Style it as a clean numbered guide, not a wall of text. Keep the dark mode aesthetic.

**Definition of Done**:
- Setup tab has a clear, numbered guide
- Webhook URLs are dynamically generated per league
- A brand-new commissioner could onboard without help

---

## Phase 2: Growth

**Timeline**: 2-4 weeks (after Phase 1 ships)
**Goal**: Get other Madden leagues using Franchise HQ. Target: 10-20 active leagues.

### 2.1 Community Launch Posts

**What**: Post on Reddit and X/Twitter to get the word out.

**Action items (Shane does these manually, not Claude)**:
- **r/Madden** (1.2M members): Post with title like "I built a free live dashboard for Madden franchise leagues -- standings, scores, rosters auto-update from Companion App." Include screenshots of The Showers dashboard. Link to the landing page.
- **r/MaddenFranchise** (smaller, more engaged): Same post, more detail about features and how it works.
- **X/Twitter**: Post a 30-second screen recording of the dashboard auto-refreshing with live data. Tag @EAMaddenNFL. Pin it.
- **Madden Discord servers**: Drop the link in franchise-recruitment channels with a short pitch.

**Timing**: Post on a Sunday evening (peak Madden hours). Have the landing page and setup guide live first.

---

### 2.2 "Powered by Franchise HQ" Watermark

**What**: Every league dashboard should have a small footer that links back to the landing page, so league members discover the product.

**Prompt for Claude**:
> Add a subtle footer to every league dashboard page that says "Powered by Franchise HQ" with a link to the root landing page (/). Style: small text, muted gray (#666), Inter font, centered at the bottom. On hover, it should brighten to electric blue. This is a growth lever -- every league member who sees the dashboard becomes a potential new commissioner.

**Definition of Done**:
- Footer appears on all league dashboard pages
- Links to the landing page
- Subtle enough to not annoy users, visible enough to drive signups

---

### 2.3 Analytics Tracking

**What**: Know how many leagues exist, how many page views, which features are used.

**Prompt for Claude**:
> Add basic analytics to franchise-hq. Two parts:
> 1. **Internal admin stats**: Add a GET /api/admin/stats endpoint (protected by a simple API key in an env var) that returns: total leagues, total page views (tracked via middleware counter stored in SQLite), leagues created in last 7 days, most active leagues by view count.
> 2. **Client-side analytics**: Add a lightweight, privacy-friendly analytics script. Use Plausible (plausible.io) -- it's free for under 10k views and doesn't need cookie consent. Add the script tag to index.html. If Plausible isn't an option, use a simple self-hosted page view counter (log page loads to a `page_views` table with timestamp, league_slug, and path).

**Definition of Done**:
- Shane can see total leagues, views, and growth trends
- No heavy third-party trackers or cookie banners needed
- Admin endpoint is protected (not publicly accessible)

---

### 2.4 Feedback Collection

**What**: Make it easy for early commissioners to report bugs and request features.

**Prompt for Claude**:
> Add a feedback mechanism to franchise-hq:
> 1. Add a small "Feedback" button (floating, bottom-right corner) on every league dashboard page.
> 2. Clicking it opens a simple modal: text area + optional email field + submit button.
> 3. Submissions go to a `feedback` table in SQLite: id, league_slug, message, email, created_at.
> 4. Add GET /api/admin/feedback (same API key protection as analytics) so Shane can read all feedback.
> 5. Optionally send a notification -- if a DISCORD_WEBHOOK_URL env var is set, POST new feedback to it so Shane gets pinged in real time.

**Definition of Done**:
- Feedback button on all league pages
- Submissions stored and retrievable by Shane
- Discord notification works if webhook URL is configured

---

## Phase 3: Monetization

**Timeline**: 4-8 weeks (after validating demand with 10+ active leagues)
**Goal**: Introduce a paid tier. Target: first paying customer.

### 3.1 Define the Tiers

**Free Tier** (what exists today):
- Standings
- Scores / matchups
- Rosters with player ratings
- Team stats
- Playoff bracket
- "Powered by Franchise HQ" watermark (cannot be removed on free)

**Pro Tier** ($5/month per league):
- Everything in Free
- Historical trends: win/loss over multiple seasons, player rating changes over time
- Draft board: track draft picks, results, and grades
- Trade analyzer: show trade history with win/loss impact analysis
- Custom branding: upload a league logo, custom league colors (replaces electric blue)
- Remove the "Powered by Franchise HQ" watermark
- Priority support (direct Discord channel or email)

### 3.2 Stripe Integration

**Prompt for Claude**:
> Add Stripe subscription billing to franchise-hq for the Pro tier ($5/month per league). Implementation:
> 1. Add `stripe` npm package.
> 2. Add a `subscriptions` table: id, league_id, stripe_customer_id, stripe_subscription_id, status (active/canceled/past_due), current_period_end.
> 3. Add env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID (create the $5/mo price in Stripe dashboard manually).
> 4. Add POST /api/leagues/:slug/subscribe -- creates a Stripe Checkout session and redirects to Stripe's hosted payment page.
> 5. Add POST /api/stripe/webhook -- handles checkout.session.completed, invoice.paid, invoice.payment_failed, customer.subscription.deleted events. Updates the subscriptions table.
> 6. Add a helper function `isProLeague(leagueSlug)` that checks subscription status. Use this to gate Pro features in both API responses and the frontend.
> 7. Add an "Upgrade to Pro" button on the league dashboard (only shown to the commissioner, identified by... for now, anyone who has the league slug can see it -- we'll add auth later).
> 8. On the landing page, add a pricing section showing Free vs Pro side by side.

**Definition of Done**:
- Commissioner can click "Upgrade to Pro" and pay via Stripe
- Subscription status is tracked and updated via webhooks
- Pro features are gated behind the subscription check
- Pricing is visible on the landing page

---

### 3.3 Pro Feature: Historical Trends

**Prompt for Claude**:
> Build the Historical Trends pro feature. This tracks league data over time so commissioners can see progression across multiple weeks and seasons.
> 1. Add a `snapshots` table that stores a copy of standings data each week (triggered when new standings are pushed via Companion App). Schema: id, league_id, season, week, team_abbr, wins, losses, ties, points_for, points_against, snapshot_date.
> 2. Add a new "Trends" tab on the dashboard (Pro only -- show a lock icon with "Upgrade to Pro" for free leagues).
> 3. On the Trends tab, render line charts showing each team's win total over weeks. Use Chart.js (lightweight, no build step needed). Dark mode styling to match the aesthetic.
> 4. Also show a table of "biggest movers" -- teams that improved or declined the most week over week.

**Definition of Done**:
- Standings are snapshotted weekly
- Trends tab shows line charts (Pro only)
- Free leagues see a teaser with upgrade CTA

---

### 3.4 Pro Feature: Draft Board

**Prompt for Claude**:
> Build the Draft Board pro feature.
> 1. The Companion App may send draft pick data in its exports -- check if `draftPickInfoList` or similar payload exists. If it does, ingest and store it.
> 2. If the Companion App does NOT send draft data, build a manual entry UI: a grid where the commissioner can input pick number, round, team, player name, position, and overall rating.
> 3. Add a "Draft" tab (Pro only) showing all picks in a round-by-round grid layout. Style: dark card per pick, team color accent on the left border, player name + position + OVR.
> 4. After the draft, show a "Draft Grades" summary: average OVR of drafted players per team, ranked.

**Definition of Done**:
- Draft picks are captured (auto or manual)
- Draft tab shows a visual board
- Draft grades calculated and displayed
- Pro gated

---

### 3.5 Pro Feature: Trade Analyzer

**Prompt for Claude**:
> Build the Trade Analyzer pro feature.
> 1. Check if the Companion App sends trade transaction data. If so, ingest it.
> 2. If not, build a manual trade log: commissioner enters Team A gave [players/picks], Team B gave [players/picks], date.
> 3. Add a "Trades" tab (Pro only) showing a timeline of all trades.
> 4. For each trade, show a simple "winner" analysis: compare the total OVR of players exchanged. This is basic but gives people something to argue about.
> 5. Show a "Trade History" per team when you click on a team in the Rosters tab.

**Definition of Done**:
- Trades are tracked (auto or manual)
- Trade timeline with winner analysis
- Per-team trade history
- Pro gated

---

## Phase 4: NCAA 26 Expansion

**Timeline**: Starts when NCAA 26 launches (likely July 2026), development in parallel with Phase 3
**Goal**: Be the first live dashboard for NCAA dynasty mode leagues.

### 4.1 Research NCAA 26 Data Access

**Action items (Shane does these at launch)**:
- Check if EA releases a Companion App for NCAA 26. Follow @EASportsCollege on X for announcements.
- Check if NCAA 26 has any export/API functionality in-game (screenshot share, cloud save access, etc.).
- Check community forums for data mining or modding efforts.
- Look for third-party tools that might expose dynasty data.

**Possible outcomes**:
- **Best case**: NCAA 26 has a companion app or API. Franchise HQ just needs a new data ingestion layer.
- **Likely case**: No companion app. Need manual data entry or screen capture.
- **Long shot**: Someone reverse-engineers the save file format. Franchise HQ could parse uploaded saves.

### 4.2 Manual Stat Entry UI (If No Companion App)

**Prompt for Claude**:
> Build a manual stat entry UI for NCAA 26 dynasty mode (there's no companion app). The commissioner or league members need to enter data by hand or by uploading screenshots.
> 1. Create a new "NCAA" league type alongside the existing "Madden" type. NCAA leagues use manual data entry instead of webhook ingestion.
> 2. Build entry forms for: team standings (wins, losses, conference record, AP ranking), weekly scores (team A vs team B, final score), and rosters (player name, position, OVR, year -- freshman/sophomore/junior/senior).
> 3. Make the forms fast to fill out: auto-complete team names, tab-through fields, bulk paste support (paste a column of scores from a spreadsheet).
> 4. Consider a "screenshot OCR" feature: user uploads a screenshot of the in-game standings screen, and we extract the data. Use Tesseract.js (runs client-side, no server cost). This is experimental -- build the manual forms first, OCR as a bonus.
> 5. The dashboard for NCAA leagues should look identical to Madden leagues (same dark mode aesthetic) but with college-specific labels (conference instead of division, class year instead of contract year, etc.).

**Definition of Done**:
- NCAA league type can be created
- Manual entry forms work and are fast to use
- Dashboard renders NCAA data correctly
- OCR is a nice-to-have, not a blocker

---

### 4.3 NCAA-Specific Features

**Prompt for Claude**:
> Add college-specific features to the NCAA league dashboard:
> 1. **Conference Standings**: Group teams by conference (SEC, Big Ten, etc.) instead of NFL divisions.
> 2. **Recruiting Board**: A tab where the commissioner can log top recruits being targeted by each team (name, position, stars, committed/uncommitted). Manual entry.
> 3. **Rivalry Tracker**: Highlight rivalry games in the schedule with a special badge. Let the commissioner mark which matchups are rivalries.
> 4. **Playoff / Bowl Projections**: Show the 12-team college football playoff bracket and bowl game matchups based on current standings.

**Definition of Done**:
- Conference standings render correctly
- Recruiting board functional
- Rivalry games highlighted
- Playoff bracket adapted for 12-team CFP format

---

## Revenue Projections (Napkin Math)

| Milestone | Leagues | MRR | Notes |
|-----------|---------|-----|-------|
| Launch | 1 (The Showers) | $0 | Free, proving the product |
| Month 1 | 10-20 | $0 | All free, building community |
| Month 2 | 50 | $50-100 | 10-20% convert to Pro |
| Month 3 | 100 | $150-250 | Word of mouth + Reddit posts |
| Month 6 | 500 | $500-1000 | NCAA 26 launch spike |
| Year 1 | 1000+ | $1500-3000 | Sustainable side income |

These are conservative. Madden sells 3-5 million copies per year. Even capturing 0.01% of franchise players is thousands of potential leagues.

---

## Infrastructure Scaling Notes

- **Current**: Single Railway instance, SQLite, $5/month hosting. This handles The Showers fine.
- **At 50 leagues**: Still fine on SQLite + Railway. Monitor DB size and response times.
- **At 200+ leagues**: Consider migrating from SQLite to PostgreSQL (Railway has managed Postgres). SQLite concurrent write limits will start to matter with many leagues pushing data simultaneously.
- **At 1000+ leagues**: Need proper infrastructure -- load balancer, managed database, CDN for static assets. Railway can scale but evaluate costs vs. alternatives (Fly.io, AWS).
- **Cost target**: Keep infrastructure costs under 30% of MRR. At $5/league/mo, each Pro league gives ~$3.50 margin after Stripe fees + hosting.

---

## Key Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| EA kills the Companion App | Product dies for new Madden versions | Diversify into NCAA (manual entry), build community lock-in |
| Low conversion to Pro | No revenue | Keep free tier generous, make Pro features genuinely valuable (not just paywalls) |
| NCAA 26 has no data access | NCAA expansion is slow/manual | Build the best manual entry UX possible, invest in OCR early |
| Competitor builds the same thing | Market share loss | Move fast, build community, be the default choice before anyone else ships |
| Railway costs spike | Margin erosion | Monitor usage, migrate to cheaper infra if needed, raise prices |

---

## Decision Log

Track major product decisions here as they're made.

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-03 | Built franchise-hq for The Showers | Needed a dashboard, nothing good existed |
| 2026-03 | Starting productization | Other commissioners want this too, opportunity to build a real product |

---

*Last updated: 2026-03-08*
*Owner: Shane | Built with Claude*
