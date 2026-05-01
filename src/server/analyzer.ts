import type { TeamStats, HeadToHead, MatchPrediction } from "./models.ts";
import { DataFetcher } from "./dataFetcher.ts";

export class MatchAnalyzer {
  private fetcher = new DataFetcher();

  analyzeMatch(homeTeam: string, awayTeam: string): MatchPrediction {
    const home = this.fetcher.getTeamStats(homeTeam);
    const away = this.fetcher.getTeamStats(awayTeam);
    const h2h = this.fetcher.getHeadToHead(homeTeam, awayTeam);

    const poisson = this.poissonPrediction(home, away);
    const elo = this.eloPrediction(home, away);
    const form = this.formPrediction(home, away);

    let homeProb = poisson[0] * 0.4 + elo[0] * 0.3 + form[0] * 0.3;
    let drawProb = poisson[1] * 0.4 + elo[1] * 0.3 + form[1] * 0.3;
    let awayProb = poisson[2] * 0.4 + elo[2] * 0.3 + form[2] * 0.3;

    const total = homeProb + drawProb + awayProb;
    homeProb = parseFloat((homeProb / total * 100).toFixed(1));
    drawProb = parseFloat((drawProb / total * 100).toFixed(1));
    awayProb = parseFloat((100 - homeProb - drawProb).toFixed(1));

    const predictedScore = this.predictScore(home, away);
    const overUnder = this.calculateOverUnder(home, away);
    const btts = this.calculateBTTS(home, away);
    
    const confidence = this.calculateConfidence(homeProb, drawProb, awayProb, home, away);
    const risk = this.assessRisk(homeProb, drawProb, awayProb, confidence);

    return {
      home_team: homeTeam,
      away_team: awayTeam,
      home_win_prob: homeProb,
      draw_prob: drawProb,
      away_win_prob: awayProb,
      predicted_score: predictedScore,
      over_under: overUnder,
      btts_prob: btts,
      risk_level: risk.level,
      risk_score: risk.score,
      confidence: confidence,
      correct_score_probs: this.calculateCorrectScores(home, away),
      analysis: this.buildAnalysis(home, away, h2h)
    };
  }

  private poissonPrediction(home: TeamStats, away: TeamStats): [number, number, number] {
    const homeExp = home.avg_goals_scored * (away.avg_goals_conceded / 1.3);
    const awayExp = away.avg_goals_scored * (home.avg_goals_conceded / 1.3);

    let hWins = 0, draws = 0, aWins = 0;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        const prob = this.poisson(homeExp, i) * this.poisson(awayExp, j);
        if (i > j) hWins += prob;
        else if (i === j) draws += prob;
        else aWins += prob;
      }
    }
    return [hWins, draws, aWins];
  }

  private poisson(lambda: number, k: number): number {
    return (Math.exp(-lambda) * Math.pow(lambda, k)) / this.factorial(k);
  }

  private factorial(n: number): number {
    if (n === 0) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  private eloPrediction(home: TeamStats, away: TeamStats): [number, number, number] {
    const homeElo = 1500 + home.points * 10;
    const awayElo = 1500 + away.points * 10;
    const exp = 1 / (1 + Math.pow(10, (awayElo - (homeElo + 50)) / 400));
    return [exp * 0.7, 0.25, (1 - exp) * 0.7]; // Rough approximation
  }

  private formPrediction(home: TeamStats, away: TeamStats): [number, number, number] {
    const getScore = (f: string) => [...f].reduce((a, c) => a + (c === 'W' ? 3 : c === 'D' ? 1 : 0), 0);
    const hScore = getScore(home.form);
    const aScore = getScore(away.form);
    const diff = (hScore - aScore) / 15;
    return [0.4 + diff * 0.2, 0.25, 0.35 - diff * 0.2];
  }

  private predictScore(home: TeamStats, away: TeamStats) {
    return {
      home: Math.round(home.avg_goals_scored * (away.avg_goals_conceded / 1.35)),
      away: Math.round(away.avg_goals_scored * (home.avg_goals_conceded / 1.35))
    };
  }

  private calculateOverUnder(home: TeamStats, away: TeamStats) {
    const totalAvg = home.avg_goals_scored + away.avg_goals_scored;
    return {
      over_0_5: parseFloat((100 * (1 - this.poisson(totalAvg, 0))).toFixed(1)),
      over_1_5: parseFloat((100 * (1 - this.poisson(totalAvg, 0) - this.poisson(totalAvg, 1))).toFixed(1)),
      over_2_5: parseFloat((100 * (1 - this.poisson(totalAvg, 0) - this.poisson(totalAvg, 1) - this.poisson(totalAvg, 2))).toFixed(1)),
      under_2_5: parseFloat((100 * (this.poisson(totalAvg, 0) + this.poisson(totalAvg, 1) + this.poisson(totalAvg, 2))).toFixed(1)),
    };
  }

  private calculateBTTS(home: TeamStats, away: TeamStats) {
    const hScoreProb = 1 - this.poisson(home.avg_goals_scored, 0);
    const aScoreProb = 1 - this.poisson(away.avg_goals_scored, 0);
    return parseFloat((hScoreProb * aScoreProb * 100).toFixed(1));
  }

  private calculateCorrectScores(home: TeamStats, away: TeamStats) {
    const hExp = home.avg_goals_scored * (away.avg_goals_conceded / 1.3);
    const aExp = away.avg_goals_scored * (home.avg_goals_conceded / 1.3);
    const scores: Record<string, number> = {};
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const prob = this.poisson(hExp, i) * this.poisson(aExp, j);
        scores[`${i}-${j}`] = parseFloat((prob * 100).toFixed(1));
      }
    }
    return Object.fromEntries(Object.entries(scores).sort((a,b) => b[1] - a[1]).slice(0, 8));
  }

  private calculateConfidence(h: number, d: number, a: number, home: TeamStats, away: TeamStats) {
    const spread = Math.max(h, d, a) - Math.min(h, d, a);
    return Math.min(95, Math.max(30, spread * 0.8 + (home.played / 40) * 20));
  }

  private assessRisk(h: number, d: number, a: number, conf: number) {
    const maxProb = Math.max(h, d, a);
    const score = 100 - (maxProb * 0.6 + conf * 0.4);
    let level = "Medium";
    if (score < 30) level = "Low";
    else if (score > 60) level = "High";
    return { score: Math.round(score), level };
  }

  private buildAnalysis(home: TeamStats, away: TeamStats, h2h: HeadToHead) {
    const insights = [];
    if (home.wins / home.played > 0.6) insights.push(`🏠 ${home.name} is dominant at home.`);
    if (away.losses / away.played > 0.5) insights.push(`✈️ ${away.name} struggles on the road.`);
    if (home.avg_goals_scored > 2) insights.push(`🔥 High-scoring trend for ${home.name}.`);
    
    return { home_team: home, away_team: away, head_to_head: h2h, key_insights: insights };
  }
}
