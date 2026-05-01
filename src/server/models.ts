export interface TeamStats {
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  clean_sheets: number;
  form: string;
  home_wins: number;
  home_draws: number;
  home_losses: number;
  away_wins: number;
  away_draws: number;
  away_losses: number;
  avg_goals_scored: number;
  avg_goals_conceded: number;
  league_position: number;
  points: number;
}

export interface HeadToHead {
  total_matches: number;
  home_wins: number;
  away_wins: number;
  draws: number;
  home_goals: number;
  away_goals: number;
}

export interface MatchPrediction {
  home_team: string;
  away_team: string;
  home_win_prob: number;
  draw_prob: number;
  away_win_prob: number;
  predicted_score: { home: number; away: number };
  over_under: Record<string, number>;
  btts_prob: number;
  risk_level: string;
  risk_score: number;
  confidence: number;
  analysis: any;
  correct_score_probs: Record<string, number>;
}
