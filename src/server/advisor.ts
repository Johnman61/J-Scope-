import type { MatchPrediction } from "./models.ts";

export class BettingAdvisor {
  generateRecommendations(pred: MatchPrediction) {
    const bets = [];

    // 1X2 Bets
    if (pred.home_win_prob > 50) {
      bets.push(this.createBet("Match Result", `${pred.home_team} Win`, pred.home_win_prob, "🏠", "Home dominance and form suggest a win."));
    } else if (pred.away_win_prob > 40) {
      bets.push(this.createBet("Match Result", `${pred.away_team} Win`, pred.away_win_prob, "✈️", "Away side has a tactical edge."));
    }

    // Over/Under
    if (pred.over_under.over_2_5 > 60) {
      bets.push(this.createBet("Over/Under", "Over 2.5 Goals", pred.over_under.over_2_5, "⬆️", "Both teams have aggressive attacking profiles."));
    } else if (pred.over_under.under_2_5 > 60) {
      bets.push(this.createBet("Over/Under", "Under 2.5 Goals", pred.over_under.under_2_5, "⬇️", "Defensive setups and low scoring history."));
    }

    // BTTS
    if (pred.btts_prob > 60) {
      bets.push(this.createBet("Both Teams To Score", "Yes", pred.btts_prob, "⚽", "High probability of both teams finding the net."));
    }

    // Double Chance
    const dcProb = pred.home_win_prob + pred.draw_prob;
    if (dcProb > 75) {
      bets.push(this.createBet("Double Chance", `${pred.home_team} or Draw`, dcProb, "🔒", "Very safe option for accumulators."));
    }

    return bets.sort((a, b) => b.probability - a.probability);
  }

  private createBet(type: string, selection: string, prob: number, emoji: string, reason: string) {
    return {
      bet_type: type,
      selection,
      probability: prob,
      implied_odds: parseFloat((100 / prob).toFixed(2)),
      confidence: prob > 70 ? "High" : prob > 50 ? "Medium" : "Low",
      emoji,
      reasoning: reason,
      suggested_stake: prob > 70 ? "High" : prob > 50 ? "Medium" : "Low"
    };
  }
}
