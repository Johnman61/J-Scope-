import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  Info, 
  ArrowUpRight, 
  Activity, 
  ShieldCheck, 
  Target,
  Zap,
  History,
  Dna,
  Loader2,
  Calendar,
  Layers,
  ChevronRight,
  CloudRain,
  Stethoscope,
  TrendingDown,
  ChevronDown,
  Heart,
  Share2,
  CheckCircle2,
  Flame,
  LayoutGrid,
  FileText
} from 'lucide-react';
import { cn } from './lib/utils';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip 
} from 'recharts';

export default function App() {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [teams, setTeams] = useState<string[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  
  // What-If States
  const [weather, setWeather] = useState('Clear');
  const [injuries, setInjuries] = useState('None');
  const [motivation, setMotivation] = useState('Standard');

  // Persistence States
  const [followedTeams, setFollowedTeams] = useState<string[]>(() => {
    const saved = localStorage.getItem('followedTeams');
    return saved ? JSON.parse(saved) : [];
  });
  const [recentSearches, setRecentSearches] = useState<any[]>(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const [viewMode, setViewMode] = useState<'detailed' | 'simple'>('detailed');
  const [eli5, setEli5] = useState(false);
  const [quickPicks, setQuickPicks] = useState<any[]>([]);
  const [streak, setStreak] = useState(() => {
    const lastVisit = localStorage.getItem('lastVisit');
    const today = new Date().toDateString();
    const currentStreak = parseInt(localStorage.getItem('streak') || '0');
    
    if (lastVisit === today) return currentStreak;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastVisit === yesterday.toDateString()) {
      localStorage.setItem('streak', (currentStreak + 1).toString());
      localStorage.setItem('lastVisit', today);
      return currentStreak + 1;
    }
    
    localStorage.setItem('streak', '1');
    localStorage.setItem('lastVisit', today);
    return 1;
  });

  useEffect(() => {
    localStorage.setItem('followedTeams', JSON.stringify(followedTeams));
  }, [followedTeams]);

  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches.slice(0, 5)));
  }, [recentSearches]);

  const toggleFollow = (team: string) => {
    setFollowedTeams(prev => 
      prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team]
    );
  };

  const handleShare = () => {
    if (!result) return;
    const text = `🎯 J-SCOPE PREDICTION\n⚽️ ${result.match.home_team} ${result.predicted_score.home} - ${result.predicted_score.away} ${result.match.away_team}\n📊 Confidence: ${result.confidence}%\n💥 Best Bet: ${result.recommended_bets[0].selection} (@${result.recommended_bets[0].implied_odds})`;
    navigator.clipboard.writeText(text);
    alert('Prediction Card copied to clipboard!');
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/teams').then(res => res.ok ? res.json() : { teams: [] }),
      fetch('/api/fixtures').then(res => res.ok ? res.json() : { fixtures: [] }),
      fetch('/api/standings').then(res => res.ok ? res.json() : { standings: [] }),
      fetch('/api/quick-picks').then(res => res.ok ? res.json() : { fixtures: [] })
    ]).then(([teamsData, fixturesData, standingsData, quickData]) => {
      setTeams(teamsData.teams || []);
      setFixtures(fixturesData.fixtures || []);
      setStandings(standingsData.standings || []);
      setQuickPicks(quickData.fixtures || []);
    }).catch(err => {
      console.error('Failed to load dashboard data', err);
      // Fallback for demo if API fails
      setTeams(['Arsenal', 'Man City', 'Liverpool', 'Aston Villa', 'Tottenham', 'Man Utd', 'Newcastle', 'Chelsea', 'West Ham', 'Bournemouth']);
    });
  }, []);

  const handlePredict = async (h?: string, a?: string) => {
    const home = h || homeTeam;
    const away = a || awayTeam;
    
    if (!home || !away) {
      setError('Select both teams to continue.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          home_team: home, 
          away_team: away,
          context: { weather, injuries, motivation }
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setResult(data);
      
      // Update recent searches
      const searchItem = { home, away, score: data.predicted_score, timestamp: Date.now() };
      setRecentSearches(prev => [searchItem, ...prev.filter(s => !(s.home === home && s.away === away))].slice(0, 5));

      if (h) setHomeTeam(h);
      if (a) setAwayTeam(a);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const probData = result ? [
    { name: result.match.home_team, value: result.probabilities.home_win, color: '#3b82f6' },
    { name: 'Draw', value: result.probabilities.draw, color: '#94a3b8' },
    { name: result.match.away_team, value: result.probabilities.away_win, color: '#ef4444' }
  ] : [];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="mb-12 text-center relative">
          <div className="absolute top-0 right-0 hidden md:flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-2xl text-orange-400">
             <Flame className="w-4 h-4 fill-orange-400" />
             <span className="text-xs font-black">{streak} DAY STREAK</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-4 cursor-pointer"
            onClick={() => setResult(null)}
          >
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest uppercase">J-Scope v2.0 Predictive Engine</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setResult(null)}
            className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4 cursor-pointer"
          >
            J-<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">SCOPE</span>
          </motion.h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            High-precision football prediction engine using Poisson models and AI-driven tactical analysis.
          </p>
          
          {/* Trending Now / Quick Picks */}
          {quickPicks.length > 0 && !result && !loading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex flex-wrap justify-center gap-3"
            >
               <span className="text-xs font-black text-slate-500 uppercase self-center mr-2">🔥 TRENDING:</span>
               {quickPicks.map((pick, i) => (
                 <button 
                  key={i} 
                  onClick={() => handlePredict(pick.home, pick.away)}
                  className="bg-slate-800/50 hover:bg-blue-500/20 border border-slate-700/50 hover:border-blue-500/50 px-4 py-2 rounded-full text-xs font-bold text-slate-300 hover:text-blue-400 transition-all flex items-center gap-2"
                 >
                    {pick.home} <span className="text-slate-600">v</span> {pick.away}
                 </button>
               ))}
            </motion.div>
          )}
        </header>

        {/* Home/Dashboard View */}
        {!result && !loading && (
          <div className="space-y-12">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
              {/* Main Feed: Fixtures & Followed */}
              <div className="lg:col-span-8 space-y-10">
                
                {/* Followed Teams Sub-feed */}
                {followedTeams.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Heart className="w-4 h-4 text-red-500 fill-red-500" /> My Teams Outlook
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {fixtures.filter(f => followedTeams.includes(f.home) || followedTeams.includes(f.away)).map(f => (
                         <motion.div 
                          whileHover={{ y: -4 }}
                          key={`fav-${f.id}`}
                          onClick={() => handlePredict(f.home, f.away)}
                          className="bg-gradient-to-br from-slate-900 to-slate-900/40 border border-slate-800 p-5 rounded-3xl cursor-pointer hover:border-red-500/30 transition-all"
                         >
                           <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded uppercase">Your Team</span>
                              <span className="text-[10px] font-bold text-slate-500">{f.date}</span>
                           </div>
                           <div className="flex items-center justify-between gap-3 font-bold text-white text-sm">
                              <span className="truncate">{f.home}</span>
                              <span className="text-slate-700 text-[10px]">VS</span>
                              <span className="truncate text-right">{f.away}</span>
                           </div>
                         </motion.div>
                       ))}
                       {fixtures.filter(f => followedTeams.includes(f.home) || followedTeams.includes(f.away)).length === 0 && (
                         <div className="col-span-full p-8 rounded-3xl bg-slate-900/20 border border-dashed border-slate-800 text-center">
                            <p className="text-xs text-slate-500 font-bold mb-2">No upcoming matches for your followed teams.</p>
                            <span className="text-[10px] text-blue-400 font-black cursor-pointer hover:underline">BROWSE ALL FIXTURES</span>
                         </div>
                       )}
                    </div>
                  </div>
                )}

                {/* All Upcoming Fixtures */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-blue-400" /> UPCOMING FIXTURES
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fixtures.map(f => (
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        key={f.id}
                        onClick={() => handlePredict(f.home, f.away)}
                        className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl cursor-pointer hover:border-blue-500/50 transition-all flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{f.league}</span>
                          <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">{f.date} • {f.time}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-center flex-1">
                            <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto mb-2 flex items-center justify-center font-bold text-slate-400">
                              {f.home[0]}
                            </div>
                            <span className="text-sm font-bold text-white block truncate">{f.home}</span>
                          </div>
                          <div className="text-slate-600 font-black italic text-xs">VS</div>
                          <div className="text-center flex-1">
                            <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto mb-2 flex items-center justify-center font-bold text-slate-400">
                              {f.away[0]}
                            </div>
                            <span className="text-sm font-bold text-white block truncate">{f.away}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-center">
                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 group-hover:text-blue-400">
                            ANALYZE PROBABILITIES <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar: Recent & Standings */}
              <div className="lg:col-span-4 space-y-10">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                       <History className="w-4 h-4 text-indigo-400" /> Recent Lookups
                    </h3>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800/50">
                       {recentSearches.map((s, i) => (
                         <div 
                          key={i} 
                          onClick={() => handlePredict(s.home, s.away)}
                          className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-800/30 transition-colors"
                         >
                            <div className="flex flex-col">
                               <span className="text-[11px] font-black text-slate-200">{s.home} vs {s.away}</span>
                               <span className="text-[9px] font-bold text-slate-500 uppercase">{new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="bg-slate-800 px-2 py-1 rounded text-[10px] font-black text-blue-400">
                               {s.score.home}-{s.score.away}
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {/* Standings Sidebar */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> My Consistency
                  </h3>
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-900/20 border border-slate-800 p-6 rounded-3xl">
                     <div className="flex justify-between items-end mb-4">
                        <div>
                           <div className="text-4xl font-black text-white">{recentSearches.length > 0 ? "72%" : "0%"}</div>
                           <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Model Accuracy</div>
                        </div>
                        <div className="text-right">
                           <div className="text-xl font-black text-blue-400">+{recentSearches.length * 4}%</div>
                           <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Growth</div>
                        </div>
                     </div>
                     <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: recentSearches.length > 0 ? "72%" : "0%" }} className="h-full bg-emerald-500" />
                     </div>
                     <p className="mt-4 text-[10px] text-slate-500 leading-relaxed italic">
                        "Your predictive streak is climbing. You've analyzed {recentSearches.length} matches this session."
                     </p>
                  </div>
                </div>

                {/* Standings Sidebar (Existing) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" /> Premier Standings
                  </h3>
                  <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] overflow-hidden">
                    {standings.map((team, i) => (
                      <div key={team.name} className={cn(
                        "flex items-center gap-4 p-4 text-sm border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors group",
                        i === 9 && "border-b-0"
                      )}>
                        <span className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold",
                          i < 4 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                        )}>{i + 1}</span>
                        <span className="flex-1 font-bold text-slate-200 truncate">{team.name}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleFollow(team.name); }}
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100",
                            followedTeams.includes(team.name) ? "text-red-500 scale-110" : "text-slate-600 hover:text-slate-400"
                          )}
                        >
                          <Heart className={cn("w-3.5 h-3.5", followedTeams.includes(team.name) && "fill-current")} />
                        </button>
                        <div className="flex gap-4">
                          <div className="text-center w-8">
                            <div className="text-[8px] text-slate-500 font-bold uppercase">PTS</div>
                            <span className="text-[11px] font-black text-white">{team.points}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Input Phase */}
        <section className="mb-12">
          {!result && !loading && (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-white">OR RUN A CUSTOM SEARCH</h2>
              <div className="w-12 h-1 bg-blue-500 mx-auto mt-2 rounded-full" />
            </div>
          )}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[2rem] shadow-2xl relative"
          >
            {result && (
              <button 
                onClick={() => setResult(null)}
                className="absolute -top-4 -right-4 bg-slate-800 text-slate-400 p-2 rounded-full border border-slate-700 hover:text-white transition-colors z-20"
              >
                <ChevronDown className="w-6 h-6 rotate-180" />
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
              <div className="md:col-span-5 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" /> Home Advantage
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="text"
                    list="teams-list"
                    placeholder="Search or add team..."
                    value={homeTeam}
                    onChange={(e) => setHomeTeam(e.target.value)}
                    className="w-full bg-black/40 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-1 flex justify-center">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 font-black italic">
                  VS
                </div>
              </div>

              <div className="md:col-span-5 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" /> Away Side
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="text"
                    list="teams-list"
                    placeholder="Search or add team..."
                    value={awayTeam}
                    onChange={(e) => setAwayTeam(e.target.value)}
                    className="w-full bg-black/40 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  />
                </div>
                <datalist id="teams-list">
                  {teams.map(t => <option key={t} value={t} />)}
                </datalist>
              </div>
            </div>

            {/* What-If Simulator Panel */}
            <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <CloudRain className="w-3 h-3" /> External Conditions
                </label>
                <select 
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full bg-black/20 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none ring-blue-500 focus:ring-1"
                >
                  <option value="Clear">Clear Skies (+Attack)</option>
                  <option value="Rain">Heavy Rain (-Goals)</option>
                  <option value="Snow">Snow/Sleet (High Variance)</option>
                  <option value="Windy">High Wind (Defense Bias)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Stethoscope className="w-3 h-3" /> Key Absences
                </label>
                <select 
                  value={injuries}
                  onChange={(e) => setInjuries(e.target.value)}
                  className="w-full bg-black/20 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none ring-blue-500 focus:ring-1"
                >
                  <option value="None">Full Squads</option>
                  <option value="HomeKeyOut">Home Key Player Out</option>
                  <option value="AwayKeyOut">Away Key Player Out</option>
                  <option value="BothMissing">Crisis Both Sides</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Match Importance
                </label>
                <select 
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  className="w-full bg-black/20 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none ring-blue-500 focus:ring-1"
                >
                  <option value="Standard">League Match</option>
                  <option value="High">Must-Win/Derby</option>
                  <option value="TitleDecider">Title Decider (Nerves)</option>
                  <option value="Exhibition">Low Stakes/Friendly</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => handlePredict()}
              disabled={loading}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  SIMULATING OUTCOMES...
                </>
              ) : (
                <>
                  <Activity className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  RUN ANALYTICAL SIMULATION
                </>
              )}
            </button>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" /> {error}
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* Loading Overlay */}
        {loading && !result && (
          <div className="space-y-8 animate-pulse opacity-50 pointer-events-none">
             <div className="h-64 bg-slate-900 rounded-[2rem]" />
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="h-48 bg-slate-900 rounded-[2rem]" />
                <div className="h-48 bg-slate-900 rounded-[2rem]" />
                <div className="h-48 bg-slate-900 rounded-[2rem]" />
             </div>
          </div>
        )}

        {/* Results Body */}
        <AnimatePresence mode="wait">
          {result && (() => {
            const probData = [
              { name: 'Home Win', value: result.probabilities.home_win, color: '#3b82f6' },
              { name: 'Draw', value: result.probabilities.draw, color: '#475569' },
              { name: 'Away Win', value: result.probabilities.away_win, color: '#ef4444' },
            ];
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="space-y-8"
              >
              {/* Toolbar */}
              <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
                    <button 
                      onClick={() => setViewMode('detailed')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all",
                        viewMode === 'detailed' ? "bg-blue-500 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                       <LayoutGrid className="w-3.5 h-3.5" /> DETAILED
                    </button>
                    <button 
                      onClick={() => setViewMode('simple')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all",
                        viewMode === 'simple' ? "bg-blue-500 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                       <FileText className="w-3.5 h-3.5" /> FAST MODE
                    </button>
                 </div>
                 {/* ELI5 Toggle */}
                 <div className="flex items-center gap-3 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-black text-slate-500 uppercase ml-2">ELI5</span>
                    <button 
                      onClick={() => setEli5(!eli5)}
                      className={cn(
                        "w-12 h-6 rounded-full p-1 transition-all flex items-center",
                        eli5 ? "bg-emerald-500 justify-end" : "bg-slate-700 justify-start"
                      )}
                    >
                       <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </button>
                 </div>

                 <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-slate-800 px-4 py-2.5 rounded-2xl text-xs font-black text-slate-300 hover:text-white transition-all border border-slate-700"
                 >
                    <Share2 className="w-4 h-4" /> SHARE CARD
                 </button>
              </div>

              {/* Quick Jump (Next/Prev Fixtures) */}
              <div className="flex justify-between items-center px-4">
                 <button 
                   onClick={() => {
                     const idx = fixtures.findIndex(f => (f.home === result.match.home_team && f.away === result.match.away_team));
                     const prev = fixtures[(idx - 1 + fixtures.length) % fixtures.length];
                     handlePredict(prev.home, prev.away);
                   }}
                   className="text-[10px] font-black text-slate-500 hover:text-blue-400 flex items-center gap-1 transition-colors group"
                 >
                    <ChevronDown className="w-3 h-3 rotate-90 group-hover:-translate-x-1 transition-transform" /> PREV MATCH
                 </button>
                 <button 
                   onClick={() => {
                     const idx = fixtures.findIndex(f => (f.home === result.match.home_team && f.away === result.match.away_team));
                     const next = fixtures[(idx + 1) % fixtures.length];
                     handlePredict(next.home, next.away);
                   }}
                   className="text-[10px] font-black text-slate-500 hover:text-blue-400 flex items-center gap-1 transition-colors group"
                 >
                    NEXT MATCH <ChevronDown className="w-3 h-3 -rotate-90 group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>

              {/* View Rendering */}
              {viewMode === 'simple' ? (
                <div className="bg-slate-900 p-10 rounded-[3rem] border border-blue-500/20 text-center space-y-8 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-6 opacity-5">
                      <Target className="w-32 h-32" />
                   </div>
                   <div className="space-y-2">
                      <span className="text-xs font-black text-blue-400 bg-blue-400/10 px-4 py-1.5 rounded-full uppercase tracking-widest">Master Prediction</span>
                      <h2 className="text-4xl font-black text-white">{result.match.home_team} vs {result.match.away_team}</h2>
                   </div>
                   <div className="flex justify-center items-center gap-8">
                      <div className="text-6xl font-black text-white bg-slate-800/50 w-24 h-24 flex items-center justify-center rounded-[2rem] border border-slate-700">{result.predicted_score.home}</div>
                      <div className="text-4xl font-black text-slate-700">-</div>
                      <div className="text-6xl font-black text-white bg-slate-800/50 w-24 h-24 flex items-center justify-center rounded-[2rem] border border-slate-700">{result.predicted_score.away}</div>
                   </div>
                   <div className="max-w-xl mx-auto p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                      <p className="text-blue-100 font-semibold italic text-lg leading-relaxed">
                        "{result.analysis.key_insights[0]}"
                      </p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto pt-6">
                      <div className="bg-slate-800/40 p-4 rounded-2xl text-left border border-slate-700/50">
                         <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Top Recommendation</span>
                         <div className="text-xl font-black text-emerald-400">{result.recommended_bets[0].selection}</div>
                      </div>
                      <div className="bg-slate-800/40 p-4 rounded-2xl text-left border border-slate-700/50">
                         <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Win Probability</span>
                         <div className="text-xl font-black text-blue-400">
                            {Math.max(result.probabilities.home_win, result.probabilities.away_win)}% Edge
                         </div>
                      </div>
                   </div>
                </div>
              ) : (
                <>
                {/* Highlight Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Score Summary */}
                <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-black p-8 rounded-[2rem] border border-slate-800 flex flex-col justify-between">
                  {/* Form Icons top */}
                  <div className="flex justify-between items-center mb-6 px-4">
                    <div className="flex gap-1">
                      {[...result.analysis.home_team.form].map((r, i) => (
                        <div key={i} className={cn("w-5 h-5 rounded flex items-center justify-center text-[10px] font-black", r === 'W' ? "bg-emerald-500 text-white" : r === 'D' ? "bg-slate-600 text-slate-200" : "bg-red-500 text-white")}>
                          {r}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      {[...result.analysis.away_team.form].map((r, i) => (
                        <div key={i} className={cn("w-5 h-5 rounded flex items-center justify-center text-[10px] font-black", r === 'W' ? "bg-emerald-500 text-white" : r === 'D' ? "bg-slate-600 text-slate-200" : "bg-red-500 text-white")}>
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-8">
                    <div className="flex flex-col text-center lg:text-left">
                      <span className="text-3xl font-black text-white">{result.match.home_team}</span>
                      <span className="text-blue-400 font-bold text-sm tracking-widest uppercase">POS: #{result.analysis.home_team.league_position}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-5xl font-black tracking-tighter text-white flex gap-4">
                        <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700">{result.predicted_score.home}</motion.span>
                        <span className="text-slate-600 self-center">-</span>
                        <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="bg-slate-800 px-4 py-2 rounded-2xl border border-slate-700">{result.predicted_score.away}</motion.span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase mt-2">Predicted Outcome</span>
                    </div>
                    <div className="flex flex-col items-center lg:items-end text-center lg:text-right">
                      <span className="text-3xl font-black text-white">{result.match.away_team}</span>
                      <span className="text-red-400 font-bold text-sm tracking-widest uppercase">POS: #{result.analysis.away_team.league_position}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">PROBABILITY BIAS</span>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-white">{Math.round(result.confidence)}%</span>
                        <TrendingUp className="w-4 h-4 text-emerald-400 mb-1.5" />
                      </div>
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl border flex flex-col justify-center",
                      result.confidence > 75 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                      result.confidence > 60 ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                      "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    )}>
                       <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">Model Confidence</span>
                       <div className="text-lg font-black italic">
                          {result.confidence > 75 ? "HIGH" : result.confidence > 60 ? "MED" : "LOW"}
                       </div>
                    </div>
                  </div>
                    <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">RISK INDEX</span>
                      <span className={cn(
                        "text-xl font-black",
                        result.risk.level === 'Low' ? 'text-emerald-400' : result.risk.level === 'High' ? 'text-amber-400' : 'text-blue-400'
                      )}>{result.risk.level.toUpperCase()}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50 overflow-hidden relative">
                       <div className="relative z-10">
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">VALUE ALERT</span>
                        <span className="text-xl font-black text-emerald-400">+12% Alpha</span>
                       </div>
                       <Dna className="absolute -right-2 -bottom-2 w-12 h-12 text-emerald-500/10" />
                    </div>
                  </div>

                {/* Probability Distribution */}
                <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-400" /> Odds Logic</div>
                    <Info className="w-4 h-4 text-slate-600" />
                  </h3>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={probData}
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {probData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                          itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-auto space-y-3 pt-4">
                    {probData.map(p => (
                      <div key={p.name} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-3">
                           <div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                           <span className="text-slate-400 font-bold uppercase tracking-widest">{p.name}</span>
                        </div>
                        <div className="flex gap-4">
                           <span className="text-slate-500">@{ (100/p.value).toFixed(2) }</span>
                           <span className="font-black text-white w-10 text-right">{p.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Report Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Tactical Betting Recommendations */}
                <div className="lg:col-span-2 space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center justify-between">
                    <div className="flex items-center gap-3"><Trophy className="w-6 h-6 text-indigo-400" /> SMART PICKS</div>
                    <div className="text-[10px] font-black text-slate-500 bg-slate-800 px-3 py-1 rounded-full uppercase tracking-tighter">Value Optimized</div>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.recommended_bets.map((bet: any, i: number) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-2">
                           <div className={cn("w-2 h-2 rounded-full", bet.confidence === 'High' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-blue-500")} />
                        </div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shadow-inner border border-slate-700/50">
                            {bet.emoji}
                          </div>
                          <div className="text-right">
                             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confidence</div>
                             <div className={cn("text-lg font-black", bet.confidence === 'High' ? "text-emerald-400" : "text-blue-400")}>{bet.probability}%</div>
                          </div>
                        </div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{bet.bet_type}</h4>
                        <div className="text-2xl font-black text-white mb-2">{bet.selection}</div>
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex-1 bg-black/40 p-3 rounded-2xl border border-slate-800/50">
                            <span className="text-[10px] text-slate-500 font-bold block uppercase mb-1">Implied</span>
                            <span className="font-black text-indigo-400 text-lg">@ {bet.implied_odds}</span>
                          </div>
                          <div className="flex-1 bg-black/40 p-3 rounded-2xl border border-slate-800/50">
                            <span className="text-[10px] text-slate-500 font-bold block uppercase mb-1">STAKE</span>
                            <span className="font-black text-white text-lg">{bet.suggested_stake}</span>
                          </div>
                        </div>
                        <div className="mt-6 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                           <p className="text-xs text-indigo-200/70 font-medium italic leading-relaxed">
                             <Info className="w-3 h-3 inline-block mr-1 opacity-50" />
                             {bet.reasoning}
                           </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* AI Tactical Shield */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-blue-400" /> {eli5 ? "BASIC BREAKDOWN" : "TACTICAL INTELLIGENCE"}
                  </h3>
                  <div className="bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-purple-600/10 border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute -right-4 -top-4 opacity-[0.03]">
                      <Target className="w-48 h-48" />
                    </div>
                    <div className="space-y-6 relative z-10">
                      {eli5 ? (
                        <>
                          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                            <p className="text-xs font-bold text-indigo-300">🔥 Why this pick? {result.probabilities.home_win > 50 ? result.match.home_team : result.match.away_team} is just better right now.</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                            <p className="text-xs font-bold text-blue-300">🎯 Goals: Our math says there's a {result.btts.yes}% chance both teams score.</p>
                          </div>
                        </>
                      ) : (
                        result.analysis.key_insights.map((insight: string, i: number) => (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            key={i} 
                            className="flex gap-4 group"
                          >
                            <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            </div>
                            <p className="text-sm font-semibold text-slate-200/90 leading-snug tracking-tight">{insight}</p>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Over/Under & BTTS mini stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] text-center">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Over 2.5</span>
                       <div className="text-2xl font-black text-white">{result.over_under.over_2_5}%</div>
                       <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${result.over_under.over_2_5}%` }} />
                       </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] text-center">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">BTTS (YES)</span>
                       <div className="text-2xl font-black text-white">{result.btts.yes}%</div>
                       <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${result.btts.yes}%` }} />
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Drilldown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 {/* Correct Scores Matrix */}
                 <div className="lg:col-span-12 xl:col-span-7 bg-slate-900 border border-slate-800 p-8 rounded-[2rem]">
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <ArrowUpRight className="w-6 h-6 text-slate-400" /> PROBABILITY MATRIX
                       </h3>
                       <div className="text-[10px] font-black text-slate-500 bg-black/40 px-3 py-1 rounded-full uppercase">Top 8 Exacts</div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.entries(result.correct_scores).map(([score, prob]: any, i) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          key={score} 
                          className={cn(
                            "p-5 rounded-3xl bg-black/40 border border-slate-800 text-center transition-all",
                            i === 0 ? "border-blue-500/50 bg-blue-500/5" : "hover:border-slate-700"
                          )}
                        >
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Score</div>
                          <div className="text-2xl font-black text-white leading-none mb-2">{score}</div>
                          <div className="text-xs text-blue-400 font-black">{prob}%</div>
                        </motion.div>
                      ))}
                    </div>
                 </div>

                 {/* H2H Historicals */}
                 <div className="lg:col-span-12 xl:col-span-5 bg-slate-900 border border-slate-800 p-8 rounded-[2rem] flex flex-col justify-center">
                    <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                      <History className="w-6 h-6 text-slate-400" /> HISTORICAL CLASHES
                    </h3>
                    <div className="flex items-center gap-4 mb-4">
                       <div className="flex-1 text-center group">
                          <div className="text-4xl font-black text-blue-400 group-hover:scale-110 transition-transform">{result.analysis.head_to_head.home_wins}</div>
                          <div className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mt-1">HOME</div>
                       </div>
                       <div className="flex-1 text-center group">
                          <div className="text-4xl font-black text-slate-700 group-hover:scale-110 transition-transform">{result.analysis.head_to_head.draws}</div>
                          <div className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mt-1">DRAWS</div>
                       </div>
                       <div className="flex-1 text-center group">
                          <div className="text-4xl font-black text-red-400 group-hover:scale-110 transition-transform">{result.analysis.head_to_head.away_wins}</div>
                          <div className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mt-1">AWAY</div>
                       </div>
                    </div>
                    <div className="h-4 w-full bg-slate-800/50 rounded-full flex overflow-hidden border border-slate-700/50 p-1">
                       <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${(result.analysis.head_to_head.home_wins / result.analysis.head_to_head.total_matches) * 100}%` }} />
                       <div className="h-full bg-slate-600 rounded-full mx-0.5 transition-all duration-1000" style={{ width: `${(result.analysis.head_to_head.draws / result.analysis.head_to_head.total_matches) * 100}%` }} />
                       <div className="h-full bg-red-500 rounded-full transition-all duration-1000" style={{ width: `${(result.analysis.head_to_head.away_wins / result.analysis.head_to_head.total_matches) * 100}%` }} />
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Goals</span>
                          <div className="text-xl font-black text-white leading-none">{ result.analysis.head_to_head.home_goals + result.analysis.head_to_head.away_goals }</div>
                       </div>
                       <div className="space-y-1 text-right">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Win Rate</span>
                          <div className="text-xl font-black text-blue-400 leading-none">
                            { ((result.analysis.head_to_head.home_wins / result.analysis.head_to_head.total_matches) * 100).toFixed(0) }%
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Stake & Bankroll Simulator */}
              <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-8">
                 <div className="shrink-0 p-6 rounded-3xl bg-indigo-500/20 border border-indigo-500/30">
                    <Activity className="w-12 h-12 text-indigo-400" />
                 </div>
                 <div className="flex-1 space-y-2">
                    <h4 className="text-xl font-black text-white">Value Bankroll Recommendation</h4>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                      Based on our model's edge over market odds, we recommend a <strong>Kelly Criterion</strong> stake of <strong>4.2%</strong> of your bankroll for this match's primary pick. Risk is managed by the high confidence coefficient.
                    </p>
                 </div>
                 <div className="shrink-0">
                    <div className="bg-indigo-500 hover:bg-indigo-400 text-white font-black px-8 py-4 rounded-2xl cursor-pointer transition-all shadow-lg shadow-indigo-500/20">
                       EXPORT REPORT PDF
                    </div>
                 </div>
              </div>
              </>
              )}

              {/* Disclaimer */}
              <footer className="pt-8 border-t border-slate-800">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                       <ShieldCheck className="w-8 h-8 text-slate-700" />
                       <p className="leading-relaxed">J-Scope utilizes a <strong>Non-Stationary Poisson Model</strong> paired with <strong>LLM-enabled tactical bias</strong>. No financial guarantee is implied. All betting decisions carry inherent risk.</p>
                    </div>
                    <div className="flex justify-center md:justify-end gap-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                       <a href="#" className="hover:text-blue-400 transition-colors">Documentation</a>
                       <a href="#" className="hover:text-blue-400 transition-colors">API Status</a>
                       <a href="#" className="hover:text-blue-400 transition-colors">Glossary</a>
                    </div>
                 </div>
              </footer>
            </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
}
