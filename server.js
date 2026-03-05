const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// DATABASE SETUP
// ============================================================
const db = new Database(path.join(__dirname, 'franchise.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS league_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    imported_at TEXT DEFAULT (datetime('now')),
    export_type TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS standings (
    team_abbr TEXT PRIMARY KEY,
    team_name TEXT,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    ties INTEGER DEFAULT 0,
    pts_for INTEGER DEFAULT 0,
    pts_against INTEGER DEFAULT 0,
    div_wins INTEGER DEFAULT 0,
    div_losses INTEGER DEFAULT 0,
    div_ties INTEGER DEFAULT 0,
    conf_wins INTEGER DEFAULT 0,
    conf_losses INTEGER DEFAULT 0,
    seed INTEGER DEFAULT 0,
    prev_rank INTEGER DEFAULT 0,
    off_total_yds INTEGER DEFAULT 0,
    off_pass_yds INTEGER DEFAULT 0,
    off_rush_yds INTEGER DEFAULT 0,
    def_total_yds INTEGER DEFAULT 0,
    def_pass_yds INTEGER DEFAULT 0,
    def_rush_yds INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS rosters (
    roster_id TEXT,
    team_abbr TEXT,
    first_name TEXT,
    last_name TEXT,
    position TEXT,
    overall INTEGER DEFAULT 0,
    age INTEGER DEFAULT 0,
    jersey_num INTEGER DEFAULT 0,
    speed_rating INTEGER DEFAULT 0,
    awareness_rating INTEGER DEFAULT 0,
    strength_rating INTEGER DEFAULT 0,
    agility_rating INTEGER DEFAULT 0,
    accel_rating INTEGER DEFAULT 0,
    throw_power INTEGER DEFAULT 0,
    throw_acc_short INTEGER DEFAULT 0,
    throw_acc_mid INTEGER DEFAULT 0,
    throw_acc_deep INTEGER DEFAULT 0,
    catching INTEGER DEFAULT 0,
    carrying INTEGER DEFAULT 0,
    trucking INTEGER DEFAULT 0,
    elusiveness INTEGER DEFAULT 0,
    bcvision INTEGER DEFAULT 0,
    stiff_arm INTEGER DEFAULT 0,
    spin_move INTEGER DEFAULT 0,
    juke_move INTEGER DEFAULT 0,
    break_tackle INTEGER DEFAULT 0,
    tackle INTEGER DEFAULT 0,
    hit_power INTEGER DEFAULT 0,
    man_coverage INTEGER DEFAULT 0,
    zone_coverage INTEGER DEFAULT 0,
    press INTEGER DEFAULT 0,
    pursuit INTEGER DEFAULT 0,
    play_rec INTEGER DEFAULT 0,
    block_shed INTEGER DEFAULT 0,
    finesse_move INTEGER DEFAULT 0,
    power_move INTEGER DEFAULT 0,
    run_block INTEGER DEFAULT 0,
    pass_block INTEGER DEFAULT 0,
    kick_power INTEGER DEFAULT 0,
    kick_accuracy INTEGER DEFAULT 0,
    dev_trait INTEGER DEFAULT 0,
    years_pro INTEGER DEFAULT 0,
    height TEXT DEFAULT '',
    weight INTEGER DEFAULT 0,
    college TEXT DEFAULT '',
    injury_length INTEGER DEFAULT 0,
    contract_years INTEGER DEFAULT 0,
    contract_salary INTEGER DEFAULT 0,
    is_on_ir INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (roster_id, team_abbr)
  );

  CREATE TABLE IF NOT EXISTS weekly_passing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week INTEGER,
    roster_id TEXT,
    team_abbr TEXT,
    full_name TEXT DEFAULT '',
    pass_att INTEGER DEFAULT 0,
    pass_comp INTEGER DEFAULT 0,
    pass_yds INTEGER DEFAULT 0,
    pass_tds INTEGER DEFAULT 0,
    pass_ints INTEGER DEFAULT 0,
    sacks_taken INTEGER DEFAULT 0,
    passer_rating REAL DEFAULT 0,
    longest_pass INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS weekly_rushing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week INTEGER,
    roster_id TEXT,
    team_abbr TEXT,
    full_name TEXT DEFAULT '',
    rush_att INTEGER DEFAULT 0,
    rush_yds INTEGER DEFAULT 0,
    rush_tds INTEGER DEFAULT 0,
    rush_fumbles INTEGER DEFAULT 0,
    rush_longest INTEGER DEFAULT 0,
    rush_broken_tackles INTEGER DEFAULT 0,
    rush_yds_after_contact INTEGER DEFAULT 0,
    rush_20plus INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS weekly_receiving (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week INTEGER,
    roster_id TEXT,
    team_abbr TEXT,
    full_name TEXT DEFAULT '',
    rec_catches INTEGER DEFAULT 0,
    rec_yds INTEGER DEFAULT 0,
    rec_tds INTEGER DEFAULT 0,
    rec_drops INTEGER DEFAULT 0,
    rec_longest INTEGER DEFAULT 0,
    rec_catch_pct REAL DEFAULT 0,
    rec_yac INTEGER DEFAULT 0,
    rec_targets INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS weekly_defense (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week INTEGER,
    roster_id TEXT,
    team_abbr TEXT,
    full_name TEXT DEFAULT '',
    def_tackles INTEGER DEFAULT 0,
    def_sacks REAL DEFAULT 0,
    def_ints INTEGER DEFAULT 0,
    def_forced_fumbles INTEGER DEFAULT 0,
    def_fumble_rec INTEGER DEFAULT 0,
    def_tds INTEGER DEFAULT 0,
    def_safeties INTEGER DEFAULT 0,
    def_passes_deflected INTEGER DEFAULT 0,
    def_catches_allowed INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS weekly_kicking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week INTEGER,
    roster_id TEXT,
    team_abbr TEXT,
    full_name TEXT DEFAULT '',
    fg_att INTEGER DEFAULT 0,
    fg_made INTEGER DEFAULT 0,
    fg_longest INTEGER DEFAULT 0,
    xp_att INTEGER DEFAULT 0,
    xp_made INTEGER DEFAULT 0,
    kickoff_tbs INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS weekly_punting (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week INTEGER,
    roster_id TEXT,
    team_abbr TEXT,
    full_name TEXT DEFAULT '',
    punt_att INTEGER DEFAULT 0,
    punt_yds INTEGER DEFAULT 0,
    punt_longest INTEGER DEFAULT 0,
    punt_in20 INTEGER DEFAULT 0,
    punt_tbs INTEGER DEFAULT 0,
    punt_net_yds INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS team_stats (
    team_abbr TEXT PRIMARY KEY,
    off_total_yds INTEGER DEFAULT 0,
    off_pass_yds INTEGER DEFAULT 0,
    off_rush_yds INTEGER DEFAULT 0,
    off_pts_per_game REAL DEFAULT 0,
    def_total_yds INTEGER DEFAULT 0,
    def_pass_yds INTEGER DEFAULT 0,
    def_rush_yds INTEGER DEFAULT 0,
    def_pts_per_game REAL DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_losses INTEGER DEFAULT 0,
    total_ties INTEGER DEFAULT 0,
    total_pts_for INTEGER DEFAULT 0,
    total_pts_against INTEGER DEFAULT 0,
    turnover_diff INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS export_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    export_type TEXT NOT NULL,
    record_count INTEGER DEFAULT 0,
    raw_keys TEXT DEFAULT '',
    exported_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS team_map (
    franchise_id TEXT PRIMARY KEY,
    team_abbr TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week INTEGER,
    home_team TEXT,
    away_team TEXT,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    is_complete INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Normalize double slashes (happens when export URL has trailing slash)
app.use((req, res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/+/g, '/');
  }
  next();
});

// ============================================================
// MADDEN COMPANION APP EXPORT ROUTES
// The companion app sends POST requests to your base URL.
// It sends multiple requests with different JSON payloads.
// We detect the data type from the JSON keys.
// ============================================================

// Helper: safely get value or default
function val(obj, key, def = 0) {
  return obj[key] !== undefined && obj[key] !== null ? obj[key] : def;
}

// Helper: map team ID to abbreviation (Madden uses numeric IDs sometimes)
const TEAM_MAP = {
  0:'FA',1:'CHI',2:'CIN',3:'BUF',4:'DEN',5:'CLE',6:'TB',7:'ARI',8:'LAC',
  9:'KC',10:'IND',11:'DAL',12:'MIA',13:'PHI',14:'ATL',15:'SF',16:'NYG',
  17:'JAX',18:'NYJ',19:'DET',20:'GB',21:'CAR',22:'NE',23:'LV',24:'NO',
  25:'BAL',26:'WAS',27:'SEA',28:'LAR',29:'PIT',30:'HOU',31:'TEN',32:'MIN'
};

// Nickname → abbreviation for franchise mode (teamId is a long unique ID, not 0-32)
const TEAM_NAME_MAP = {
  'ravens':'BAL','steelers':'PIT','bengals':'CIN','browns':'CLE',
  'texans':'HOU','colts':'IND','jaguars':'JAX','titans':'TEN',
  'bills':'BUF','dolphins':'MIA','patriots':'NE','jets':'NYJ',
  'broncos':'DEN','chiefs':'KC','raiders':'LV','chargers':'LAC',
  'cowboys':'DAL','giants':'NYG','eagles':'PHI','commanders':'WAS',
  'bears':'CHI','lions':'DET','packers':'GB','vikings':'MIN',
  'falcons':'ATL','panthers':'CAR','saints':'NO','buccaneers':'TB',
  '49ers':'SF','rams':'LAR','seahawks':'SEA','cardinals':'ARI'
};

function resolveTeam(raw, nameHint) {
  const s = String(raw || '').trim();
  // Already a valid short abbr (2-4 non-numeric chars)
  if (s.length >= 2 && s.length <= 4 && !/^\d/.test(s)) return s.toUpperCase();
  // Static Madden ID map (0-32)
  const n = parseInt(s);
  if (!isNaN(n) && TEAM_MAP[n] && n <= 32) return TEAM_MAP[n];
  // Dynamic franchise ID → abbr from team_map table
  try {
    const base = s.replace(/\.0$/, ''); // strip trailing .0
    const row = db.prepare('SELECT team_abbr FROM team_map WHERE franchise_id=? OR franchise_id=?').get(s, base);
    if (row) return row.team_abbr;
  } catch(e) {}
  // Fall back to team name lookup
  if (nameHint) {
    const key = String(nameHint).toLowerCase().replace(/[^a-z0-9]/g,'');
    if (TEAM_NAME_MAP[key]) return TEAM_NAME_MAP[key];
    // Try just the last word (e.g. "Baltimore Ravens" → "ravens")
    const words = key.split(/\s+/);
    const last = words[words.length - 1];
    if (TEAM_NAME_MAP[last]) return TEAM_NAME_MAP[last];
  }
  return s || 'UNK';
}

// CATCH-ALL: Accept all POST requests and detect data type from body
app.post('*', (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.json({ success: true, message: 'Empty body received' });
    }

    const keys = Object.keys(body);
    let processed = false;

    // --- LEAGUE TEAM INFO (team metadata + build franchise ID map) ---
    if (body.leagueTeamInfoList && Array.isArray(body.leagueTeamInfoList)) {
      const list = body.leagueTeamInfoList;
      const mapInsert = db.prepare(`INSERT OR REPLACE INTO team_map (franchise_id, team_abbr) VALUES (?, ?)`);
      const upsert = db.prepare(`
        INSERT INTO standings (team_abbr, team_name)
        VALUES (?, ?)
        ON CONFLICT(team_abbr) DO UPDATE SET
          team_name=excluded.team_name, updated_at=datetime('now')
      `);
      const tx = db.transaction(() => {
        for (const t of list) {
          // Use abbrName directly — Companion App always sends this
          const abbr = t.abbrName || resolveTeam(t.teamId || t.teamIndex, t.nickName || t.displayName);
          const name = t.nickName || t.displayName || abbr;
          // Store franchise_id → abbr mapping for all future data
          const fid = String(t.teamId || t.teamIndex || '');
          if (fid) {
            mapInsert.run(fid, abbr);
            mapInsert.run(fid.replace(/\.0$/, ''), abbr); // also store without .0
          }
          upsert.run(abbr, name);
        }
        // Remap all existing long IDs in every table to proper abbreviations
        const allMaps = db.prepare('SELECT franchise_id, team_abbr FROM team_map').all();
        const tables = ['standings','rosters','weekly_passing','weekly_rushing','weekly_receiving',
          'weekly_defense','weekly_kicking','weekly_punting','team_stats','schedules'];
        for (const m of allMaps) {
          for (const tbl of tables) {
            try {
              db.prepare(`UPDATE ${tbl} SET team_abbr=? WHERE team_abbr=? OR team_abbr=?`)
                .run(m.team_abbr, m.franchise_id, m.franchise_id.replace(/\.0$/, ''));
              if (tbl === 'schedules') {
                db.prepare(`UPDATE schedules SET home_team=? WHERE home_team=? OR home_team=?`)
                  .run(m.team_abbr, m.franchise_id, m.franchise_id.replace(/\.0$/, ''));
                db.prepare(`UPDATE schedules SET away_team=? WHERE away_team=? OR away_team=?`)
                  .run(m.team_abbr, m.franchise_id, m.franchise_id.replace(/\.0$/, ''));
              }
            } catch(e) {}
          }
        }
      });
      tx();
      logExport('leagueTeamInfo', list.length, keys);
      processed = true;
    }

    // --- TEAM STANDINGS (wins/losses/pts — separate from leagueTeamInfoList) ---
    if (body.teamStandingInfoList && Array.isArray(body.teamStandingInfoList)) {
      const list = body.teamStandingInfoList;
      const upsert = db.prepare(`
        INSERT INTO standings (team_abbr, team_name, wins, losses, ties, pts_for, pts_against,
          div_wins, div_losses, div_ties, conf_wins, conf_losses, seed, prev_rank)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(team_abbr) DO UPDATE SET
          team_name=excluded.team_name, wins=excluded.wins, losses=excluded.losses, ties=excluded.ties,
          pts_for=excluded.pts_for, pts_against=excluded.pts_against,
          div_wins=excluded.div_wins, div_losses=excluded.div_losses, div_ties=excluded.div_ties,
          conf_wins=excluded.conf_wins, conf_losses=excluded.conf_losses,
          seed=excluded.seed, prev_rank=excluded.prev_rank, updated_at=datetime('now')
      `);
      const tx = db.transaction(() => {
        for (const t of list) {
          const abbr = t.abbrName || resolveTeam(t.teamId || t.teamIndex, t.nickName || t.displayName);
          const name = t.nickName || t.displayName || abbr;
          upsert.run(abbr, name,
            val(t,'seasonWins') || val(t,'wins') || val(t,'totalWins'),
            val(t,'seasonLosses') || val(t,'losses') || val(t,'totalLosses'),
            val(t,'seasonTies') || val(t,'ties') || val(t,'totalTies'),
            val(t,'totalPtsFor') || val(t,'ptsFor'),
            val(t,'totalPtsAgainst') || val(t,'ptsAgainst'),
            val(t,'divWins'), val(t,'divLosses'), val(t,'divTies'),
            val(t,'confWins'), val(t,'confLosses'),
            val(t,'seed') || val(t,'playoffSeedNumber'),
            val(t,'prevRank') || val(t,'rank'));
        }
      });
      tx();
      logExport('teamStandingInfo', list.length, keys);
      processed = true;
    }

    // --- GAME SCHEDULE / SCORES ---
    if ((body.gameScheduleInfoList || body.scheduleInfoList) && Array.isArray(body.gameScheduleInfoList || body.scheduleInfoList)) {
      const list = body.gameScheduleInfoList || body.scheduleInfoList;
      const upsert = db.prepare(`
        INSERT INTO schedules (week, home_team, away_team, home_score, away_score, is_complete)
        VALUES (?,?,?,?,?,?)
      `);
      const clear = db.prepare('DELETE FROM schedules');
      const tx = db.transaction(() => {
        clear.run();
        for (const g of list) {
          const week = val(g,'weekIndex') || val(g,'week');
          const home = resolveTeam(g.homeTeamId || g.homeTeam, g.homeNickname);
          const away = resolveTeam(g.awayTeamId || g.awayTeam, g.awayNickname);
          const done = g.isGameOver || g.isComplete || g.isGameComplete ? 1 : 0;
          upsert.run(week, home, away, val(g,'homeScore'), val(g,'awayScore'), done);
        }
      });
      tx();
      logExport('gameScheduleInfo', list.length, keys);
      processed = true;
    }

    // --- ROSTER INFO ---
    if (body.rosterInfoList && Array.isArray(body.rosterInfoList)) {
      const list = body.rosterInfoList;
      const upsert = db.prepare(`
        INSERT INTO rosters (roster_id, team_abbr, first_name, last_name, position, overall,
          age, jersey_num, speed_rating, awareness_rating, strength_rating, agility_rating,
          accel_rating, throw_power, throw_acc_short, throw_acc_mid, throw_acc_deep,
          catching, carrying, trucking, elusiveness, bcvision, stiff_arm, spin_move, juke_move,
          break_tackle, tackle, hit_power, man_coverage, zone_coverage, press, pursuit, play_rec,
          block_shed, finesse_move, power_move, run_block, pass_block, kick_power, kick_accuracy,
          dev_trait, years_pro, height, weight, college, injury_length, contract_years, contract_salary, is_on_ir)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(roster_id, team_abbr) DO UPDATE SET
          first_name=excluded.first_name, last_name=excluded.last_name, position=excluded.position,
          overall=excluded.overall, age=excluded.age, jersey_num=excluded.jersey_num,
          speed_rating=excluded.speed_rating, awareness_rating=excluded.awareness_rating,
          strength_rating=excluded.strength_rating, agility_rating=excluded.agility_rating,
          accel_rating=excluded.accel_rating, throw_power=excluded.throw_power,
          throw_acc_short=excluded.throw_acc_short, throw_acc_mid=excluded.throw_acc_mid,
          throw_acc_deep=excluded.throw_acc_deep, catching=excluded.catching,
          carrying=excluded.carrying, trucking=excluded.trucking, elusiveness=excluded.elusiveness,
          bcvision=excluded.bcvision, stiff_arm=excluded.stiff_arm, spin_move=excluded.spin_move,
          juke_move=excluded.juke_move, break_tackle=excluded.break_tackle, tackle=excluded.tackle,
          hit_power=excluded.hit_power, man_coverage=excluded.man_coverage,
          zone_coverage=excluded.zone_coverage, press=excluded.press, pursuit=excluded.pursuit,
          play_rec=excluded.play_rec, block_shed=excluded.block_shed,
          finesse_move=excluded.finesse_move, power_move=excluded.power_move,
          run_block=excluded.run_block, pass_block=excluded.pass_block,
          kick_power=excluded.kick_power, kick_accuracy=excluded.kick_accuracy,
          dev_trait=excluded.dev_trait, years_pro=excluded.years_pro,
          height=excluded.height, weight=excluded.weight, college=excluded.college,
          injury_length=excluded.injury_length, contract_years=excluded.contract_years,
          contract_salary=excluded.contract_salary, is_on_ir=excluded.is_on_ir,
          updated_at=datetime('now')
      `);
      const tx = db.transaction(() => {
        for (const p of list) {
          const team = resolveTeam(p.teamId || p.teamName || p.team);
          const rid = String(p.rosterId || p.playerId || Math.random().toString(36).substr(2,9));
          upsert.run(rid, team, val(p,'firstName',''), val(p,'lastName',''),
            val(p,'position',''), val(p,'playerSchemeOvr') || val(p,'overallRating') || val(p,'overall'),
            val(p,'age'), val(p,'jerseyNum'), val(p,'speedRating'), val(p,'awareRating'),
            val(p,'strengthRating'), val(p,'agilityRating'), val(p,'accelRating'),
            val(p,'throwPowerRating'), val(p,'throwAccShortRating'), val(p,'throwAccMidRating'),
            val(p,'throwAccDeepRating'), val(p,'catchingRating'), val(p,'carryingRating'),
            val(p,'truckingRating'), val(p,'elusivenessRating') || val(p,'changeOfDirectionRating'),
            val(p,'bcVisionRating'), val(p,'stiffArmRating'), val(p,'spinMoveRating'),
            val(p,'jukeMoveRating'), val(p,'breakTackleRating'), val(p,'tackleRating'),
            val(p,'hitPowerRating'), val(p,'manCoverRating'), val(p,'zoneCoverRating'),
            val(p,'pressRating'), val(p,'pursuitRating'), val(p,'playRecRating'),
            val(p,'blockShedRating'), val(p,'finesseMoveRating'), val(p,'powerMoveRating'),
            val(p,'runBlockRating'), val(p,'passBlockRating'),
            val(p,'kickPowerRating'), val(p,'kickAccRating'),
            val(p,'devTrait'), val(p,'yearsPro'),
            val(p,'height',''), val(p,'weight'), val(p,'college',''),
            val(p,'injuryLength'), val(p,'contractYearsLeft') || val(p,'contractLength'),
            val(p,'contractSalary') || val(p,'totalSalary'), val(p,'isOnIR') ? 1 : 0);
        }
      });
      tx();
      logExport('rosterInfo', list.length, keys);
      processed = true;
    }

    // --- TEAM STATS ---
    if (body.teamStatInfoList && Array.isArray(body.teamStatInfoList)) {
      const list = body.teamStatInfoList;
      const upsert = db.prepare(`
        INSERT INTO team_stats (team_abbr, off_total_yds, off_pass_yds, off_rush_yds,
          def_total_yds, def_pass_yds, def_rush_yds,
          total_wins, total_losses, total_ties, total_pts_for, total_pts_against, turnover_diff)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(team_abbr) DO UPDATE SET
          off_total_yds=excluded.off_total_yds, off_pass_yds=excluded.off_pass_yds,
          off_rush_yds=excluded.off_rush_yds, def_total_yds=excluded.def_total_yds,
          def_pass_yds=excluded.def_pass_yds, def_rush_yds=excluded.def_rush_yds,
          total_wins=excluded.total_wins, total_losses=excluded.total_losses,
          total_ties=excluded.total_ties, total_pts_for=excluded.total_pts_for,
          total_pts_against=excluded.total_pts_against, turnover_diff=excluded.turnover_diff,
          updated_at=datetime('now')
      `);
      const tx = db.transaction(() => {
        for (const t of list) {
          const abbr = resolveTeam(t.teamId || t.teamName || t.team);
          upsert.run(abbr,
            val(t,'offTotalYds'), val(t,'offPassYds'), val(t,'offRushYds'),
            val(t,'defTotalYds'), val(t,'defPassYds'), val(t,'defRushYds'),
            val(t,'totalWins'), val(t,'totalLosses'), val(t,'totalTies'),
            val(t,'totalPtsFor'), val(t,'totalPtsAgainst'), val(t,'tODiff'));
        }
      });
      tx();
      logExport('teamStatInfo', list.length, keys);
      processed = true;
    }

    // --- WEEKLY PASSING STATS ---
    if (body.playerPassingStatInfoList && Array.isArray(body.playerPassingStatInfoList)) {
      processWeeklyStat('passing', body.playerPassingStatInfoList, keys);
      processed = true;
    }

    // --- WEEKLY RUSHING STATS ---
    if (body.playerRushingStatInfoList && Array.isArray(body.playerRushingStatInfoList)) {
      processWeeklyStat('rushing', body.playerRushingStatInfoList, keys);
      processed = true;
    }

    // --- WEEKLY RECEIVING STATS ---
    if (body.playerReceivingStatInfoList && Array.isArray(body.playerReceivingStatInfoList)) {
      processWeeklyStat('receiving', body.playerReceivingStatInfoList, keys);
      processed = true;
    }

    // --- WEEKLY DEFENSIVE STATS ---
    if (body.playerDefensiveStatInfoList && Array.isArray(body.playerDefensiveStatInfoList)) {
      processWeeklyStat('defense', body.playerDefensiveStatInfoList, keys);
      processed = true;
    }

    // --- WEEKLY KICKING STATS ---
    if (body.playerKickingStatInfoList && Array.isArray(body.playerKickingStatInfoList)) {
      processWeeklyStat('kicking', body.playerKickingStatInfoList, keys);
      processed = true;
    }

    // --- WEEKLY PUNTING STATS ---
    if (body.playerPuntingStatInfoList && Array.isArray(body.playerPuntingStatInfoList)) {
      processWeeklyStat('punting', body.playerPuntingStatInfoList, keys);
      processed = true;
    }

    // --- SCHEDULE INFO ---
    if (body.scheduleInfoList && Array.isArray(body.scheduleInfoList)) {
      const list = body.scheduleInfoList;
      const upsert = db.prepare(`
        INSERT INTO schedules (week, home_team, away_team, home_score, away_score, is_complete)
        VALUES (?,?,?,?,?,?)
      `);
      const clear = db.prepare('DELETE FROM schedules');
      const tx = db.transaction(() => {
        clear.run();
        for (const g of list) {
          upsert.run(val(g,'weekIndex'), resolveTeam(g.homeTeamId || g.homeTeam),
            resolveTeam(g.awayTeamId || g.awayTeam),
            val(g,'homeScore'), val(g,'awayScore'),
            g.isGameComplete || g.isComplete ? 1 : 0);
        }
      });
      tx();
      logExport('scheduleInfo', list.length, keys);
      processed = true;
    }

    if (!processed) {
      // Store raw data for any unrecognized format
      db.prepare('INSERT INTO league_info (data, export_type) VALUES (?, ?)').run(JSON.stringify(body), 'unknown');
      logExport('unknown', 0, keys);
    }

    res.json({ success: true, message: 'Data received' });
  } catch (err) {
    console.error('Export processing error:', err);
    res.status(200).json({ success: true, message: 'Received with errors: ' + err.message });
  }
});

// Weekly stat processor
function processWeeklyStat(type, list, keys) {
  const weekNum = list.length > 0 ? (val(list[0], 'weekIndex') || val(list[0], 'week') || 0) : 0;

  if (type === 'passing') {
    const ins = db.prepare(`INSERT INTO weekly_passing (week, roster_id, team_abbr, full_name,
      pass_att, pass_comp, pass_yds, pass_tds, pass_ints, sacks_taken, passer_rating, longest_pass)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
    const del = db.prepare('DELETE FROM weekly_passing WHERE week = ?');
    const tx = db.transaction(() => {
      del.run(weekNum);
      for (const s of list) {
        ins.run(val(s,'weekIndex') || val(s,'week') || weekNum,
          String(val(s,'rosterId','')), resolveTeam(s.teamId || s.teamName || s.team),
          val(s,'fullName',''), val(s,'passAtt'), val(s,'passComp'), val(s,'passYds'),
          val(s,'passTDs'), val(s,'passInts'), val(s,'sacksTaken'),
          val(s,'passerRating',0.0), val(s,'passLongest'));
      }
    });
    tx();
  } else if (type === 'rushing') {
    const ins = db.prepare(`INSERT INTO weekly_rushing (week, roster_id, team_abbr, full_name,
      rush_att, rush_yds, rush_tds, rush_fumbles, rush_longest, rush_broken_tackles, rush_yds_after_contact, rush_20plus)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
    const del = db.prepare('DELETE FROM weekly_rushing WHERE week = ?');
    const tx = db.transaction(() => {
      del.run(weekNum);
      for (const s of list) {
        ins.run(val(s,'weekIndex') || val(s,'week') || weekNum,
          String(val(s,'rosterId','')), resolveTeam(s.teamId || s.teamName || s.team),
          val(s,'fullName',''), val(s,'rushAtt'), val(s,'rushYds'), val(s,'rushTDs'),
          val(s,'rushFum'), val(s,'rushLongest'), val(s,'rushBrokenTackles'),
          val(s,'rushYdsAfterContact'), val(s,'rush20PlusYds'));
      }
    });
    tx();
  } else if (type === 'receiving') {
    const ins = db.prepare(`INSERT INTO weekly_receiving (week, roster_id, team_abbr, full_name,
      rec_catches, rec_yds, rec_tds, rec_drops, rec_longest, rec_catch_pct, rec_yac, rec_targets)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
    const del = db.prepare('DELETE FROM weekly_receiving WHERE week = ?');
    const tx = db.transaction(() => {
      del.run(weekNum);
      for (const s of list) {
        ins.run(val(s,'weekIndex') || val(s,'week') || weekNum,
          String(val(s,'rosterId','')), resolveTeam(s.teamId || s.teamName || s.team),
          val(s,'fullName',''), val(s,'recCatches'), val(s,'recYds'), val(s,'recTDs'),
          val(s,'recDrops'), val(s,'recLongest'), val(s,'recCatchPct',0.0),
          val(s,'recYAC') || val(s,'recYacPerCatch'), val(s,'recToPct') || val(s,'targets'));
      }
    });
    tx();
  } else if (type === 'defense') {
    const ins = db.prepare(`INSERT INTO weekly_defense (week, roster_id, team_abbr, full_name,
      def_tackles, def_sacks, def_ints, def_forced_fumbles, def_fumble_rec, def_tds, def_safeties, def_passes_deflected, def_catches_allowed)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const del = db.prepare('DELETE FROM weekly_defense WHERE week = ?');
    const tx = db.transaction(() => {
      del.run(weekNum);
      for (const s of list) {
        ins.run(val(s,'weekIndex') || val(s,'week') || weekNum,
          String(val(s,'rosterId','')), resolveTeam(s.teamId || s.teamName || s.team),
          val(s,'fullName',''), val(s,'defTotalTackles') || val(s,'defTackles'),
          val(s,'defSacks',0.0), val(s,'defInts'), val(s,'defForcedFum'),
          val(s,'defFumRec'), val(s,'defTDs'), val(s,'defSafeties'),
          val(s,'defDeflections') || val(s,'defPassDeflections'), val(s,'defCatchAllowed'));
      }
    });
    tx();
  } else if (type === 'kicking') {
    const ins = db.prepare(`INSERT INTO weekly_kicking (week, roster_id, team_abbr, full_name,
      fg_att, fg_made, fg_longest, xp_att, xp_made, kickoff_tbs)
      VALUES (?,?,?,?,?,?,?,?,?,?)`);
    const del = db.prepare('DELETE FROM weekly_kicking WHERE week = ?');
    const tx = db.transaction(() => {
      del.run(weekNum);
      for (const s of list) {
        ins.run(val(s,'weekIndex') || val(s,'week') || weekNum,
          String(val(s,'rosterId','')), resolveTeam(s.teamId || s.teamName || s.team),
          val(s,'fullName',''), val(s,'fGAtt'), val(s,'fGMade'), val(s,'fGLongest'),
          val(s,'xPAtt'), val(s,'xPMade'), val(s,'kickoffTBs'));
      }
    });
    tx();
  } else if (type === 'punting') {
    const ins = db.prepare(`INSERT INTO weekly_punting (week, roster_id, team_abbr, full_name,
      punt_att, punt_yds, punt_longest, punt_in20, punt_tbs, punt_net_yds)
      VALUES (?,?,?,?,?,?,?,?,?,?)`);
    const del = db.prepare('DELETE FROM weekly_punting WHERE week = ?');
    const tx = db.transaction(() => {
      del.run(weekNum);
      for (const s of list) {
        ins.run(val(s,'weekIndex') || val(s,'week') || weekNum,
          String(val(s,'rosterId','')), resolveTeam(s.teamId || s.teamName || s.team),
          val(s,'fullName',''), val(s,'puntAtt'), val(s,'puntYds'), val(s,'puntLongest'),
          val(s,'puntsIn20'), val(s,'puntTBs'), val(s,'puntNetYds'));
      }
    });
    tx();
  }

  logExport(type + 'Stats', list.length, keys);
}

function logExport(type, count, keys) {
  db.prepare('INSERT INTO export_log (export_type, record_count, raw_keys) VALUES (?,?,?)')
    .run(type, count, JSON.stringify(keys));
  console.log(`[IMPORT] ${type}: ${count} records`);
}

// ============================================================
// DASHBOARD API ROUTES
// ============================================================

// GET standings
app.get('/api/standings', (req, res) => {
  const rows = db.prepare('SELECT * FROM standings ORDER BY wins DESC, pts_for DESC').all();
  res.json(rows);
});

// GET rosters
app.get('/api/rosters', (req, res) => {
  const team = req.query.team;
  const pos = req.query.position;
  const sort = req.query.sort || 'overall';
  const dir = req.query.dir || 'DESC';
  const limit = parseInt(req.query.limit) || 200;

  let query = 'SELECT * FROM rosters WHERE 1=1';
  const params = [];

  if (team && team !== 'ALL') { query += ' AND team_abbr = ?'; params.push(team); }
  if (pos && pos !== 'ALL') { query += ' AND position = ?'; params.push(pos); }

  const allowed = ['overall','age','speed_rating','awareness_rating','strength_rating','first_name','last_name','position'];
  const sortCol = allowed.includes(sort) ? sort : 'overall';
  const sortDir = dir === 'ASC' ? 'ASC' : 'DESC';
  query += ` ORDER BY ${sortCol} ${sortDir} LIMIT ?`;
  params.push(limit);

  res.json(db.prepare(query).all(...params));
});

// GET team stats
app.get('/api/team-stats', (req, res) => {
  res.json(db.prepare('SELECT * FROM team_stats ORDER BY total_wins DESC').all());
});

// GET weekly stats
app.get('/api/stats/:type', (req, res) => {
  const type = req.params.type;
  const week = req.query.week;
  const limit = parseInt(req.query.limit) || 100;

  const tables = {
    passing: 'weekly_passing',
    rushing: 'weekly_rushing',
    receiving: 'weekly_receiving',
    defense: 'weekly_defense',
    kicking: 'weekly_kicking',
    punting: 'weekly_punting',
  };

  const table = tables[type];
  if (!table) return res.status(400).json({ error: 'Invalid stat type' });

  let query = `SELECT * FROM ${table}`;
  const params = [];
  if (week) { query += ' WHERE week = ?'; params.push(parseInt(week)); }

  // Default sort by main stat
  const sorts = {
    passing: 'pass_yds', rushing: 'rush_yds', receiving: 'rec_yds',
    defense: 'def_tackles', kicking: 'fg_made', punting: 'punt_yds'
  };
  query += ` ORDER BY ${sorts[type]} DESC LIMIT ?`;
  params.push(limit);

  res.json(db.prepare(query).all(...params));
});

// GET available weeks
app.get('/api/weeks', (req, res) => {
  const weeks = new Set();
  ['weekly_passing','weekly_rushing','weekly_receiving','weekly_defense','weekly_kicking','weekly_punting'].forEach(t => {
    try {
      db.prepare(`SELECT DISTINCT week FROM ${t}`).all().forEach(r => weeks.add(r.week));
    } catch(e) {}
  });
  res.json([...weeks].sort((a,b) => a-b));
});

// GET schedules
app.get('/api/schedules', (req, res) => {
  res.json(db.prepare('SELECT * FROM schedules ORDER BY week ASC').all());
});

// GET export log
app.get('/api/exports', (req, res) => {
  res.json(db.prepare('SELECT * FROM export_log ORDER BY exported_at DESC LIMIT 50').all());
});

// GET raw unknown/debug data (last 5 unrecognized payloads)
app.get('/api/raw', (req, res) => {
  const rows = db.prepare('SELECT * FROM league_info ORDER BY imported_at DESC LIMIT 5').all();
  res.json(rows.map(r => ({ ...r, data: JSON.parse(r.data) })));
});

// GET team ID map
app.get('/api/teammap', (req, res) => {
  res.json(db.prepare('SELECT * FROM team_map').all());
});

// GET league summary
app.get('/api/summary', (req, res) => {
  const standings = db.prepare('SELECT COUNT(*) as count FROM standings WHERE wins > 0 OR losses > 0').get();
  const players = db.prepare('SELECT COUNT(*) as count FROM rosters').get();
  const exports = db.prepare('SELECT COUNT(*) as count FROM export_log').get();
  const lastExport = db.prepare('SELECT exported_at FROM export_log ORDER BY exported_at DESC LIMIT 1').get();
  const teams = db.prepare('SELECT COUNT(DISTINCT team_abbr) as count FROM rosters').get();

  res.json({
    teamsWithRecords: standings.count,
    totalPlayers: players.count,
    totalExports: exports.count,
    teamCount: teams.count,
    lastExport: lastExport ? lastExport.exported_at : null,
  });
});

// DELETE reset
app.delete('/api/reset', (req, res) => {
  const tables = ['standings','rosters','team_stats','weekly_passing','weekly_rushing',
    'weekly_receiving','weekly_defense','weekly_kicking','weekly_punting','schedules',
    'export_log','league_info'];
  tables.forEach(t => db.prepare(`DELETE FROM ${t}`).run());
  res.json({ success: true, message: 'All data cleared' });
});

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================
// START
// ============================================================
app.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════════╗`);
  console.log(`  ║   FRANCHISE HQ — Live Dashboard          ║`);
  console.log(`  ║   Running on port ${PORT}                    ║`);
  console.log(`  ╚══════════════════════════════════════════╝\n`);
  console.log(`  Dashboard:  http://localhost:${PORT}`);
  console.log(`  Export URL: http://<your-domain>:${PORT}\n`);
  console.log(`  Paste the Export URL into the Madden Companion App.`);
  console.log(`  All POST data will be captured automatically.\n`);
});

// Graceful shutdown
process.on('SIGINT', () => { db.close(); process.exit(); });
process.on('SIGTERM', () => { db.close(); process.exit(); });
