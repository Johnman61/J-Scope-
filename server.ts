import express from "express";
import cors from "cors";
import path from "path";
import "dotenv/config";
import { createServer as createViteServer } from "vite";
import { MatchAnalyzer } from "./src/server/analyzer.ts";
import { BettingAdvisor } from "./src/server/advisor.ts";
import { DataFetcher } from "./src/server/dataFetcher.ts";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const analyzer = new MatchAnalyzer();
  const advisor = new BettingAdvisor();
  const fetcher = new DataFetcher();
  
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

  // API Routes
  app.get("/api/teams", (req, res) => {
    res.json({ teams: fetcher.getAvailableTeams() });
  });

  app.get("/api/fixtures", (req, res) => {
    res.json({ fixtures: fetcher.getUpcomingFixtures() });
  });

  app.get("/api/standings", (req, res) => {
    res.json({ standings: fetcher.getStandings() });
  });

  app.post("/api/predict", async (req, res) => {
    const { home_team, away_team, context } = req.body;
    if (!home_team || !away_team) {
      return res.status(400).json({ error: "Home and away teams are required" });
    }

    try {
      const matchContext = context || { weather: "Clear", injuries: "None" };
      const prediction = analyzer.analyzeMatch(home_team, away_team);
      const recommendations = advisor.generateRecommendations(prediction);

      // AI-Enhanced Insights using Gemini
      let aiInsights = [];
      if (genAI) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          const prompt = `Analyze this football match: ${home_team} vs ${away_team}. 
          Home Stats: ${JSON.stringify(prediction.analysis.home_team)}. 
          Away Stats: ${JSON.stringify(prediction.analysis.away_team)}.
          Conditions: Weather: ${matchContext.weather}, Key Issues: ${matchContext.injuries}.
          Provide 3-4 short, punchy tactical insights for a betting dashboard. Focus on current form, key vulnerabilities, or tactical mismatches. 
          Respond with a JSON array of strings only.`;
          
          const result = await model.generateContent(prompt);
          const responseText = result.response.text();
          const matches = responseText.match(/\[.*\]/s);
          if (matches) {
            aiInsights = JSON.parse(matches[0]);
          } else {
            aiInsights = prediction.analysis.key_insights;
          }
        } catch (aiErr) {
          console.error("AI Insight error:", aiErr);
          aiInsights = prediction.analysis.key_insights;
        }
      } else {
        aiInsights = prediction.analysis.key_insights;
      }

      res.json({
        match: { home_team: prediction.home_team, away_team: prediction.away_team },
        probabilities: {
          home_win: prediction.home_win_prob,
          draw: prediction.draw_prob,
          away_win: prediction.away_win_prob
        },
        predicted_score: prediction.predicted_score,
        over_under: prediction.over_under,
        btts: {
          yes: prediction.btts_prob,
          no: parseFloat((100 - prediction.btts_prob).toFixed(1))
        },
        correct_scores: prediction.correct_score_probs,
        risk: {
          level: prediction.risk_level,
          score: prediction.risk_score
        },
        confidence: prediction.confidence,
        analysis: {
          ...prediction.analysis,
          key_insights: aiInsights
        },
        recommended_bets: recommendations
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/quick-picks", (req, res) => {
    const fixtures = fetcher.getUpcomingFixtures().slice(0, 5);
    res.json({ fixtures });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
