import React, { useState, useEffect } from "react";

const THEME = {
  bg: "#020408",
  surface: "rgba(6, 10, 18, 0.9)",
  accent: "#00f2ff",
  danger: "#ff0055",
  success: "#00ff9f",
  warning: "#ffbd00",
  text: "#f1f5f9"
};

export default function CompleteCyberSystem() {
  const [xp, setXp] = useState(() => Number(localStorage.getItem("cs_xp")) || 0);
  const [streak, setStreak] = useState(() => Number(localStorage.getItem("cs_streak")) || 0);
  const [log, setLog] = useState(() => JSON.parse(localStorage.getItem("cs_log")) || []);
  const [penalty, setPenalty] = useState(() => Number(localStorage.getItem("cs_penalty")) || 0);
  const [lastSync, setLastSync] = useState(() => localStorage.getItem("cs_last_sync") || null);
  const [showArchive, setShowArchive] = useState(false); // NEW: Archive State
  
  const [recoveryUsed, setRecoveryUsed] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("cs_recovery"));
    const currentMonth = new Date().getMonth();
    if (saved && saved.month === currentMonth) return saved.count;
    return 0;
  });

  const [tasks, setTasks] = useState({ lab: false, academic: false, news: false });
  const [workDetails, setWorkDetails] = useState({ lab: "", academic: "", news: "" });
  const [quality, setQuality] = useState("full");

  const level = Math.floor(xp / 150) + 1;
  const progress = xp % 150;
  const recoveryRemaining = 5 - recoveryUsed;
  
  const getRank = () => {
    if (level >= 50) return "S-CLASS";
    if (level >= 35) return "A-CLASS";
    if (level >= 20) return "B-CLASS";
    if (level >= 10) return "C-CLASS";
    if (level >= 5) return "D-CLASS";
    return "E-CLASS";
  };

  useEffect(() => {
    if (lastSync) {
      const lastDate = new Date(lastSync);
      const now = new Date();
      const hoursSince = (now - lastDate) / (1000 * 60 * 60);

      if (hoursSince > 36) {
        const missedDays = Math.floor(hoursSince / 24);
        setStreak(0);
        setPenalty(prev => prev + (missedDays * 2));
        setXp(p => Math.max(0, p - (missedDays * 40)));
        setLastSync(now.toISOString()); 
        alert(`SYSTEM ALERT: ${missedDays} DAYS OF GHOSTING DETECTED. STREAK TERMINATED.`);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cs_xp", xp);
    localStorage.setItem("cs_streak", streak);
    localStorage.setItem("cs_log", JSON.stringify(log));
    localStorage.setItem("cs_penalty", penalty);
    localStorage.setItem("cs_last_sync", lastSync);
    localStorage.setItem("cs_recovery", JSON.stringify({ count: recoveryUsed, month: new Date().getMonth() }));
  }, [xp, streak, log, penalty, lastSync, recoveryUsed]);

  const todayStr = new Date().toLocaleDateString('en-GB');
  const isAlreadySynced = log.length > 0 && log[0].date === todayStr;

  const isIntegrityVerified = workDetails.lab.trim().length > 10 && workDetails.academic.trim().length > 10 && workDetails.news.trim().length > 5;
  const canSubmit = tasks.news && (tasks.lab || tasks.academic) && isIntegrityVerified && !isAlreadySynced;

  const qualityMod = quality === "full" ? 1 : quality === "reduced" ? 0.6 : 0.4;
  const potentialXp = Math.round(((tasks.lab ? 50 : 0) + (tasks.academic ? 50 : 0) + (tasks.news ? 10 : 0)) * qualityMod);

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (quality === "recovery" && recoveryRemaining <= 0) {
      alert("CRITICAL: NO RECOVERY CYCLES REMAINING THIS MONTH.");
      return;
    }
    if (quality === "recovery") setRecoveryUsed(prev => prev + 1);

    setXp(p => p + potentialXp);
    setStreak(p => p + 1);
    setPenalty(p => Math.max(0, p - 1));
    setLastSync(new Date().toISOString());
    
    setLog(prev => [{
      id: Math.random().toString(36).toUpperCase().substring(2, 7),
      date: todayStr,
      xp: potentialXp,
      labNote: workDetails.lab,
      academicNote: workDetails.academic,
      newsNote: workDetails.news,
      quality: quality
    }, ...prev]);
  };

  const handleHardReset = () => {
    if(window.confirm("CRITICAL: THIS WILL ERASE ALL CHARACTER DATA. PROCEED?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgGrid} />
      <div style={styles.scanline} />

      {/* --- ARCHIVE MODAL OVERLAY --- */}
      {showArchive && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: `1px solid ${THEME.accent}55`, paddingBottom: 10}}>
              <h2 className="glitch-text" style={{margin: 0, color: THEME.accent}}>DECRYPTED_QUEST_ARCHIVE</h2>
              <button onClick={() => setShowArchive(false)} style={styles.closeBtn}>[X] CLOSE</button>
            </div>
            
            <div style={styles.logContainer}>
              {log.length === 0 ? <p style={{opacity: 0.5, textAlign: 'center', marginTop: 50}}>NO RECORDS FOUND</p> : null}
              {log.map((entry) => (
                <div key={entry.id} style={styles.logEntry}>
                  <div style={styles.logHeader}>
                    <span>{entry.date} | HASH: {entry.id}</span>
                    <span style={{color: THEME.success}}>+{entry.xp} XP</span>
                  </div>
                  <div style={styles.logBody}>
                    <p><strong style={{color: THEME.accent}}>LAB:</strong> {entry.labNote || "N/A"}</p>
                    <p><strong style={{color: THEME.accent}}>ACADEMIC:</strong> {entry.academicNote || "N/A"}</p>
                    <p><strong style={{color: THEME.accent}}>INTEL:</strong> {entry.newsNote || "N/A"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={styles.layout}>
        {/* LEFT: PLAYER DATAFRAME */}
        <aside style={styles.card}>
          <div className="glitch-text" style={styles.label}>[ SYSTEM_MONITOR_v10 ]</div>
          <div style={{...styles.status, color: penalty > 0 ? THEME.danger : THEME.accent}}>
            {penalty > 0 ? "STATUS: DEGRADED" : "STATUS: OPTIMAL"}
          </div>
          
          <div style={{textAlign: 'center', marginBottom: '20px'}}>
            <div style={styles.rankBadge}>{getRank()}</div>
            <div style={styles.levelText}>LEVEL {level}</div>
          </div>

          <div style={styles.statRow}><span>STREAK</span><span style={{color: THEME.warning, fontWeight: 'bold'}}>{streak} DAYS</span></div>
          <div style={styles.statRow}><span>RECOVERY_CELLS</span><span style={{color: recoveryRemaining === 0 ? THEME.danger : THEME.success, fontWeight: 'bold'}}>{recoveryRemaining} / 5</span></div>

          {penalty > 0 && <div style={styles.penaltyTag}>PENALTY: {penalty}D NO PLEASURE</div>}
          
          <div style={styles.xpTracker}>
            <div style={styles.xpInfo}><span>NEXT_SYNC</span> <span>{progress} / 150</span></div>
            <div style={styles.barBg}><div style={{...styles.barFill, width: `${(progress / 150) * 100}%`}} /></div>
            <div style={styles.totalXp}>TOTAL LIFETIME XP: {xp}</div>
          </div>

          <button onClick={() => setShowArchive(true)} style={styles.archiveBtn}>ACCESS QUEST ARCHIVE</button>
          <button onClick={handleHardReset} style={styles.resetBtn}>WIPE_SYSTEM_DATA</button>
        </aside>

        {/* CENTER: INPUT HUD */}
        <main style={{...styles.card, flex: 2, borderColor: isAlreadySynced ? THEME.success : THEME.accent}}>
          <div style={styles.scannerLine} /> 
          
          {isAlreadySynced ? (
            <div style={styles.lockedBox}>
              <h1 className="glitch-text" style={{color: THEME.success}}>CORE_LOCKED</h1>
              <p style={{opacity: 0.6}}>UPLOADS SUSPENDED UNTIL NEXT CYCLE</p>
            </div>
          ) : (
            <>
              <h2 style={styles.label}>DAILY_INTEGRITY_REPORT</h2>
              <div style={styles.field}>
                <label style={{color: tasks.lab ? THEME.success : THEME.text}}><input type="checkbox" checked={tasks.lab} onChange={()=>setTasks({...tasks, lab: !tasks.lab})}/> PENETRATION_LAB [50 XP]</label>
                <textarea style={styles.area} placeholder="Detail findings/exploits (Min 10 chars)..." value={workDetails.lab} onChange={e=>setWorkDetails({...workDetails, lab: e.target.value})} />
              </div>
              <div style={styles.field}>
                <label style={{color: tasks.academic ? THEME.success : THEME.text}}><input type="checkbox" checked={tasks.academic} onChange={()=>setTasks({...tasks, academic: !tasks.academic})}/> ACADEMIC_PROTOCOL [50 XP]</label>
                <textarea style={styles.area} placeholder="Core concepts learned (Min 10 chars)..." value={workDetails.academic} onChange={e=>setWorkDetails({...workDetails, academic: e.target.value})} />
              </div>
              <div style={styles.field}>
                <label style={{color: tasks.news ? THEME.success : THEME.text}}><input type="checkbox" checked={tasks.news} onChange={()=>setTasks({...tasks, news: !tasks.news})}/> CYBER_NEWS_INTEL [10 XP]</label>
                <input style={styles.input} placeholder="Today's headline (Min 5 chars)..." value={workDetails.news} onChange={e=>setWorkDetails({...workDetails, news: e.target.value})} />
              </div>

              <div style={styles.footerRow}>
                <div style={{flex: 1}}>
                  <label style={{fontSize: '0.6rem', color: THEME.accent}}>EXECUTION_QUALITY</label>
                  <select style={styles.select} value={quality} onChange={e=>setQuality(e.target.value)}>
                    <option value="full">OVERDRIVE [1.0x]</option>
                    <option value="reduced">STABILIZED [0.6x]</option>
                    <option value="recovery">REGEN [0.4x] (-1 Cell)</option>
                  </select>
                </div>
                <div style={{flex: 1.5}}>
                   <button style={{...styles.submit, borderColor: canSubmit ? THEME.success : '#222', color: canSubmit ? THEME.success : '#444'}} disabled={!canSubmit} onClick={handleSubmit}>
                    {canSubmit ? `UPLOAD DATA [+${potentialXp} XP]` : "INTEGRITY_LOW"}
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <style>{`
        @keyframes scan { 0% { top: 0% } 100% { top: 100% } }
        @keyframes gridMove { 0% { transform: translateY(0); } 100% { transform: translateY(40px); } }
        @keyframes glitch { 0% { text-shadow: 2px 0 #ff0055, -2px 0 #00f2ff; } 50% { text-shadow: -1px 0 #ff0055, 1px 0 #00f2ff; } 100% { text-shadow: 2px 0 #ff0055, -2px 0 #00f2ff; } }
        .glitch-text { animation: glitch 0.2s infinite; }
      `}</style>
    </div>
  );
}

// --- STYLES ---
const styles = {
  container: { background: THEME.bg, color: THEME.text, minHeight: '100vh', fontFamily: "'Courier New', monospace", padding: '40px 20px', position: 'relative', overflow: 'hidden' },
  bgGrid: { position: 'fixed', top: -100, left: 0, right: 0, bottom: 0, backgroundImage: `linear-gradient(${THEME.accent}05 1px, transparent 1px), linear-gradient(90deg, ${THEME.accent}05 1px, transparent 1px)`, backgroundSize: '40px 40px', animation: 'gridMove 4s linear infinite', zIndex: 0 },
  scanline: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%)', backgroundSize: '100% 4px', zIndex: 10, pointerEvents: 'none' },
  scannerLine: { position: 'absolute', left: 0, width: '100%', height: '2px', background: `${THEME.accent}33`, boxShadow: `0 0 10px ${THEME.accent}55`, animation: 'scan 8s linear infinite', zIndex: 5, pointerEvents: 'none' },
  layout: { display: 'flex', gap: '20px', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 20 },
  card: { background: THEME.surface, border: '1px solid #1a2233', padding: '25px', borderRadius: '4px', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' },
  label: { fontSize: '0.75rem', letterSpacing: '2px', opacity: 0.7, marginBottom: '15px' },
  status: { fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '25px', letterSpacing: '1px' },
  rankBadge: { fontSize: '2.5rem', fontWeight: 'bold', color: THEME.accent, textShadow: `0 0 15px ${THEME.accent}66`, letterSpacing: '2px' },
  levelText: { fontSize: '0.9rem', color: THEME.text, opacity: 0.8 },
  statRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #ffffff11', fontSize: '0.8rem' },
  penaltyTag: { background: THEME.danger, color: '#000', padding: '8px', fontSize: '0.75rem', marginTop: '15px', fontWeight: 'bold', textAlign: 'center' },
  xpTracker: { marginTop: '30px' },
  xpInfo: { display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '8px' },
  barBg: { height: '4px', background: '#000', borderRadius: '2px', overflow: 'hidden' },
  barFill: { height: '100%', background: THEME.accent, boxShadow: `0 0 10px ${THEME.accent}` },
  totalXp: { fontSize: '0.6rem', textAlign: 'right', marginTop: '8px', opacity: 0.5 },
  field: { marginBottom: '20px' },
  area: { width: '100%', background: 'rgba(0,0,0,0.6)', border: '1px solid #1a2233', color: '#fff', padding: '10px', marginTop: '8px', fontSize: '0.8rem', resize: 'none', height: '60px', outline: 'none' },
  input: { width: '100%', background: 'rgba(0,0,0,0.6)', border: '1px solid #1a2233', color: '#fff', padding: '10px', marginTop: '8px', fontSize: '0.8rem', outline: 'none' },
  footerRow: { display: 'flex', gap: '15px', marginTop: '25px', alignItems: 'flex-end' },
  select: { width: '100%', background: '#000', color: THEME.accent, border: '1px solid #1a2233', padding: '12px', marginTop: '5px', outline: 'none' },
  submit: { width: '100%', background: 'transparent', border: '1px solid', padding: '15px', fontWeight: 'bold', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s' },
  archiveBtn: { marginTop: '30px', width: '100%', background: `${THEME.accent}22`, border: `1px solid ${THEME.accent}`, color: THEME.accent, padding: '12px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px' },
  resetBtn: { marginTop: '15px', width: '100%', background: 'transparent', border: 'none', color: THEME.danger, fontSize: '0.6rem', cursor: 'pointer', opacity: 0.4, letterSpacing: '1px' },
  
  // Modal Styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
  modalContent: { background: THEME.surface, border: `1px solid ${THEME.accent}`, width: '100%', maxWidth: '800px', height: '80%', borderRadius: '4px', padding: '30px', display: 'flex', flexDirection: 'column', boxShadow: `0 0 30px rgba(0, 242, 255, 0.1)` },
  closeBtn: { background: 'transparent', border: 'none', color: THEME.danger, cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  logContainer: { overflowY: 'auto', flex: 1, paddingRight: '10px' },
  logEntry: { background: 'rgba(0,0,0,0.4)', border: '1px solid #1a2233', padding: '15px', marginBottom: '15px', borderRadius: '4px' },
  logHeader: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a2233', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.8rem', opacity: 0.7 },
  logBody: { fontSize: '0.85rem', lineHeight: '1.5' }
};
