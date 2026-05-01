import type { TeamStats, HeadToHead } from "./models.ts";

export class DataFetcher {
  private teamDatabase: Record<string, TeamStats>;

  constructor() {
    this.teamDatabase = this.buildTeamDatabase();
  }

  private buildTeamDatabase(): Record<string, TeamStats> {
    return {
      "Manchester City": { name: "Manchester City", played: 30, wins: 23, draws: 4, losses: 3, goals_for: 72, goals_against: 25, clean_sheets: 15, form: "WWWDW", home_wins: 13, home_draws: 1, home_losses: 1, away_wins: 10, away_draws: 3, away_losses: 2, avg_goals_scored: 2.4, avg_goals_conceded: 0.83, league_position: 1, points: 73 },
      "Arsenal": { name: "Arsenal", played: 30, wins: 22, draws: 5, losses: 3, goals_for: 68, goals_against: 22, clean_sheets: 14, form: "WWWWW", home_wins: 12, home_draws: 2, home_losses: 1, away_wins: 10, away_draws: 3, away_losses: 2, avg_goals_scored: 2.27, avg_goals_conceded: 0.73, league_position: 2, points: 71 },
      "Liverpool": { name: "Liverpool", played: 30, wins: 21, draws: 6, losses: 3, goals_for: 70, goals_against: 28, clean_sheets: 12, form: "WDWWW", home_wins: 11, home_draws: 3, home_losses: 1, away_wins: 10, away_draws: 3, away_losses: 2, avg_goals_scored: 2.33, avg_goals_conceded: 0.93, league_position: 3, points: 69 },
      "Aston Villa": { name: "Aston Villa", played: 30, wins: 17, draws: 5, losses: 8, goals_for: 58, goals_against: 38, clean_sheets: 8, form: "WLWDW", home_wins: 10, home_draws: 2, home_losses: 3, away_wins: 7, away_draws: 3, away_losses: 5, avg_goals_scored: 1.93, avg_goals_conceded: 1.27, league_position: 4, points: 56 },
      "Tottenham": { name: "Tottenham", played: 30, wins: 16, draws: 4, losses: 10, goals_for: 60, goals_against: 45, clean_sheets: 6, form: "LWWDL", home_wins: 9, home_draws: 2, home_losses: 4, away_wins: 7, away_draws: 2, away_losses: 6, avg_goals_scored: 2.0, avg_goals_conceded: 1.5, league_position: 5, points: 52 },
      "Real Madrid": { name: "Real Madrid", played: 30, wins: 24, draws: 4, losses: 2, goals_for: 75, goals_against: 22, clean_sheets: 16, form: "WWWWW", home_wins: 13, home_draws: 2, home_losses: 0, away_wins: 11, away_draws: 2, away_losses: 2, avg_goals_scored: 2.5, avg_goals_conceded: 0.73, league_position: 1, points: 76 },
      "Barcelona": { name: "Barcelona", played: 30, wins: 22, draws: 5, losses: 3, goals_for: 70, goals_against: 28, clean_sheets: 13, form: "WWDWW", home_wins: 12, home_draws: 2, home_losses: 1, away_wins: 10, away_draws: 3, away_losses: 2, avg_goals_scored: 2.33, avg_goals_conceded: 0.93, league_position: 2, points: 71 },
      "Inter Milan": { name: "Inter Milan", played: 30, wins: 24, draws: 3, losses: 3, goals_for: 72, goals_against: 18, clean_sheets: 17, form: "WWWWW", home_wins: 13, home_draws: 1, home_losses: 1, away_wins: 11, away_draws: 2, away_losses: 2, avg_goals_scored: 2.4, avg_goals_conceded: 0.6, league_position: 1, points: 75 },
      "Bayern Munich": { name: "Bayern Munich", played: 30, wins: 22, draws: 3, losses: 5, goals_for: 78, goals_against: 35, clean_sheets: 10, form: "WWLWW", home_wins: 12, home_draws: 1, home_losses: 2, away_wins: 10, away_draws: 2, away_losses: 3, avg_goals_scored: 2.6, avg_goals_conceded: 1.17, league_position: 1, points: 69 },
      "PSG": { name: "PSG", played: 30, wins: 24, draws: 4, losses: 2, goals_for: 75, goals_against: 25, clean_sheets: 14, form: "WWWWW", home_wins: 13, home_draws: 2, home_losses: 0, away_wins: 11, away_draws: 2, away_losses: 2, avg_goals_scored: 2.5, avg_goals_conceded: 0.83, league_position: 1, points: 76 },
    };
  }

  getAvailableTeams(): string[] {
    return Object.keys(this.teamDatabase).sort();
  }

  getUpcomingFixtures() {
    return [
      { id: 1, home: "Arsenal", away: "Manchester City", time: "20:00", date: "Tomorrow", league: "Premier League" },
      { id: 2, home: "Liverpool", away: "Aston Villa", time: "15:00", date: "Saturday", league: "Premier League" },
      { id: 3, home: "Real Madrid", away: "Barcelona", time: "21:00", date: "Sunday", league: "La Liga" },
      { id: 4, home: "Bayern Munich", away: "Inter Milan", time: "20:00", date: "Wednesday", league: "Champions League" },
    ];
  }

  getStandings() {
    return Object.values(this.teamDatabase)
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);
  }

  getTeamStats(teamName: string): TeamStats {
    if (this.teamDatabase[teamName]) return this.teamDatabase[teamName];
    
    // Generate realistic random stats for unknown teams
    const played = 30 + Math.floor(Math.random() * 5);
    const wins = 5 + Math.floor(Math.random() * 20);
    const draws = 5 + Math.floor(Math.random() * 10);
    const losses = Math.max(0, played - wins - draws);
    const goalsFor = wins * 2 + draws;
    const goalsAgainst = losses * 2 + draws;

    return {
      name: teamName,
      played, wins, draws, losses,
      goals_for: goalsFor,
      goals_against: goalsAgainst,
      clean_sheets: Math.floor(Math.random() * 12),
      form: "WDLWD".split("").sort(() => Math.random() - 0.5).join(""),
      home_wins: Math.floor(wins / 2),
      home_draws: Math.floor(draws / 2),
      home_losses: Math.floor(losses / 2),
      away_wins: Math.ceil(wins / 2),
      away_draws: Math.ceil(draws / 2),
      away_losses: Math.ceil(losses / 2),
      avg_goals_scored: parseFloat((goalsFor / played).toFixed(2)),
      avg_goals_conceded: parseFloat((goalsAgainst / played).toFixed(2)),
      league_position: 10 + Math.floor(Math.random() * 10),
      points: wins * 3 + draws
    };
  }

  getHeadToHead(home: string, away: string): HeadToHead {
    const total = 10 + Math.floor(Math.random() * 20);
    const homeWins = Math.floor(total * 0.4);
    const awayWins = Math.floor(total * 0.3);
    const draws = total - homeWins - awayWins;

    return {
      total_matches: total,
      home_wins: homeWins,
      away_wins: awayWins,
      draws: draws,
      home_goals: homeWins * 2 + draws,
      away_goals: awayWins * 2 + draws
    };
  }
}
