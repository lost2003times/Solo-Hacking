import { useState, useEffect, useRef } from "react";
import ArchiveView from "./ArchiveView";

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
  
  // NEW: View Router State
  const [currentView, setCurrentView] = useState('hud'); 
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [recoveryUsed, setRecoveryUsed] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("cs_recovery") || "null");
    const currentMonth = new Date().getMonth();
    if (saved && saved.month === currentMonth) return saved.count;
    return 0;
  });

  const [tasks, setTasks] = useState({ lab: false, academic: false, news: false });
  const [workDetails, setWorkDetails] = useState({ lab: "", academic: "", news: "", revision: "" });
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
      const hoursSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);

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
    localStorage.setItem("cs_xp", xp.toString());
    localStorage.setItem("cs_streak", streak.toString());
    localStorage.setItem("cs_log", JSON.stringify(log));
    localStorage.setItem("cs_penalty", penalty.toString());
    if (lastSync) localStorage.setItem("cs_last_sync", lastSync);
    localStorage.setItem("cs_recovery", JSON.stringify({ count: recoveryUsed, month: new Date().getMonth() }));
  }, [xp, streak, log, penalty, lastSync, recoveryUsed]);

  const todayStr = new Date().toLocaleDateString('en-GB');
  const isAlreadySynced = log.length > 0 && log[0].date === todayStr;

  const isNewsValid = tasks.news && workDetails.news.trim().length > 5;
  let isPrimaryValid = false;
  let potentialXp = 0;
  const qualityMod = quality === "full" ? 1 : quality === "reduced" ? 0.6 : 0.4;

  if (quality === "recovery") {
    isPrimaryValid = workDetails.revision.trim().length > 10;
    potentialXp = Math.round((50 + (tasks.news ? 10 : 0)) * qualityMod);
  } else {
    const isLabValid = tasks.lab && workDetails.lab.trim().length > 10;
    const isAcademicValid = tasks.academic && workDetails.academic.trim().length > 10;
    isPrimaryValid = isLabValid || isAcademicValid;
    potentialXp = Math.round(((isLabValid ? 50 : 0) + (isAcademicValid ? 50 : 0) + (tasks.news ? 10 : 0)) * qualityMod);
  }

  const canSubmit = isNewsValid && isPrimaryValid && !isAlreadySynced;

  const downloadBackup = (backupData: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `cyber_backup_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.json`);
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleRestore = (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (importedData.cs_log !== undefined && importedData.cs_xp !== undefined) {
          setXp(importedData.cs_xp);
          setStreak(importedData.cs_streak);
          setPenalty(importedData.cs_penalty);
          setLog(importedData.cs_log);
          setLastSync(importedData.cs_last_sync);
          setRecoveryUsed(importedData.cs_recovery?.count || 0);
          alert("✅ SYSTEM RESTORED SUCCESSFULLY FROM BACKUP.");
        } else {
          alert("❌ ERROR: INVALID BACKUP FILE STRUCTURE.");
        }
      } catch (err) {
        alert("❌ ERROR: CORRUPTED DATA FILE.");
      }
    };
    reader.readAsText(file);
    event.target.value = null; 
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (quality === "recovery" && recoveryRemaining <= 0) {
      alert("CRITICAL: NO RECOVERY CYCLES REMAINING THIS MONTH.");
      return;
    }

    const newXp = xp + potentialXp;
    const newStreak = streak + 1;
    const newPenalty = Math.max(0, penalty - 1);
    const newRecoveryUsed = quality === "recovery" ? recoveryUsed + 1 : recoveryUsed;
    const newLastSync = new Date().toISOString();
    
    const newLogEntry = {
      id: Math.random().toString(36).toUpperCase().substring(2, 7),
      date: todayStr,
      xp: potentialXp,
      labNote: quality === "recovery" ? "N/A" : workDetails.lab,
      academicNote: quality === "recovery" ? "N/A" : workDetails.academic,
      revisionNote: quality === "recovery" ? workDetails.revision : "N/A",
      newsNote: workDetails.news,
      quality: quality
    };
    
    const newLog = [newLogEntry, ...log];

    if (quality === "recovery") setRecoveryUsed(newRecoveryUsed);
    setXp(newXp);
    setStreak(newStreak);
    setPenalty(newPenalty);
    setLastSync(newLastSync);
    setLog(newLog);

    downloadBackup({
      cs_xp: newXp,
      cs_streak: newStreak,
      cs_penalty: newPenalty,
      cs_log: newLog,
      cs_last_sync: newLastSync,
      cs_recovery: { count: newRecoveryUsed, month: new Date().getMonth() }
    });
  };

  const handleHardReset = () => {
    if(window.confirm("CRITICAL: THIS WILL ERASE ALL CHARACTER DATA. PROCEED?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // --- ROUTER INTERCEPT ---
  // If the user clicked Archive, render the Tailwind Shadow Protocol component
  if (currentView === 'archive') {
    return <ArchiveView log={log} setView={setCurrentView} />;
  }

  // --- MAIN HUD RENDER ---
  return (
    <div style={styles.container}>
      <div style={styles.bgGrid} />
      <div style={styles.scanline} />

      <div style={styles.layout}>
        {/* LEFT: PLAYER DATAFRAME */}
        <aside style={styles.card}>
          <div className="glitch-text" style={styles.label}>[ SYSTEM_MONITOR_v13 ]</div>
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

          {/* This button now switches the view to the Tailwind Archive! */}
          <button onClick={() => setCurrentView('archive')} style={styles.archiveBtn}>ACCESS QUEST ARCHIVE</button>
          
          <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleRestore} />
          
          <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
            <button onClick={() => fileInputRef.current?.click()} style={styles.restoreBtn}>RESTORE BACKUP</button>
            <button onClick={handleHardReset} style={styles.resetBtn}>WIPE DATA</button>
          </div>
        </aside>

        {/* CENTER: INPUT HUD */}
        <main style={{...styles.card, flex: 2, borderColor: isAlreadySynced ? THEME.success : THEME.accent}}>
          <div style={styles.scannerLine} /> 
          
          {isAlreadySynced ? (
            <div style={styles.lockedBox}>
              <h1 className="glitch-text" style={{color: THEME.success}}>CORE_LOCKED</h1>
              <p style={{opacity: 0.6}}>UPLOADS SUSPENDED UNTIL NEXT CYCLE</p>
              <p style={{fontSize: '0.7rem', color: THEME.warning, marginTop: '20px'}}>* A backup file was successfully downloaded to your device.</p>
            </div>
          ) : (
            <>
              <h2 style={styles.label}>DAILY_INTEGRITY_REPORT</h2>
              
              <div style={{marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #1a2233'}}>
                <label style={{fontSize: '0.6rem', color: THEME.accent}}>1. SELECT_EXECUTION_MODE</label>
                <select style={styles.select} value={quality} onChange={e=>setQuality(e.target.value)}>
                  <option value="full">OVERDRIVE [1.0x]</option>
                  <option value="reduced">STABILIZED [0.6x]</option>
                  <option value="recovery">REGEN/REVISION [0.4x] (-1 Cell)</option>
                </select>
              </div>

              {quality === "recovery" ? (
                <div style={styles.field}>
                  <label style={{color: workDetails.revision.length > 10 ? THEME.success : THEME.text}}>REVISION_PROTOCOL [Base 50 XP]</label>
                  <textarea style={styles.area} placeholder="What past concepts did you revise today? (Min 10 chars)..." value={workDetails.revision} onChange={e=>setWorkDetails({...workDetails, revision: e.target.value})} />
                </div>
              ) : (
                <>
                  <p style={{fontSize: '0.7rem', opacity: 0.5, marginBottom: '15px'}}>* Complete AT LEAST ONE primary objective (Lab or Academic).</p>
                  <div style={styles.field}>
                    <label style={{color: tasks.lab ? THEME.success : THEME.text}}><input type="checkbox" checked={tasks.lab} onChange={()=>setTasks({...tasks, lab: !tasks.lab})}/> PENETRATION_LAB [50 XP]</label>
                    <textarea style={styles.area} placeholder="Detail findings/exploits (Min 10 chars)..." value={workDetails.lab} onChange={e=>setWorkDetails({...workDetails, lab: e.target.value})} />
                  </div>
                  <div style={styles.field}>
                    <label style={{color: tasks.academic ? THEME.success : THEME.text}}><input type="checkbox" checked={tasks.academic} onChange={()=>setTasks({...tasks, academic: !tasks.academic})}/> ACADEMIC_PROTOCOL [50 XP]</label>
                    <textarea style={styles.area} placeholder="Core concepts learned (Min 10 chars)..." value={workDetails.academic} onChange={e=>setWorkDetails({...workDetails, academic: e.target.value})} />
                  </div>
                </>
              )}

              <div style={styles.field}>
                <label style={{color: tasks.news ? THEME.success : THEME.text}}><input type="checkbox" checked={tasks.news} onChange={()=>setTasks({...tasks, news: !tasks.news})}/> CYBER_NEWS_INTEL [10 XP]</label>
                <input style={styles.input} placeholder="Today's mandatory headline (Min 5 chars)..." value={workDetails.news} onChange={e=>setWorkDetails({...workDetails, news: e.target.value})} />
              </div>

              <button style={{...styles.submit, borderColor: canSubmit ? THEME.success : '#222', color: canSubmit ? THEME.success : '#444', marginTop: '15px'}} disabled={!canSubmit} onClick={handleSubmit}>
                {canSubmit ? `UPLOAD & AUTO-BACKUP [+${potentialXp} XP]` : "INTEGRITY_REQUIREMENTS_NOT_MET"}
              </button>
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

const styles: Record<string, React.CSSProperties> = {
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
  select: { width: '100%', background: '#000', color: THEME.accent, border: '1px solid #1a2233', padding: '12px', marginTop: '5px', outline: 'none', cursor: 'pointer' },
  submit: { width: '100%', background: 'transparent', border: '1px solid', padding: '15px', fontWeight: 'bold', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s' },
  archiveBtn: { marginTop: '30px', width: '100%', background: `${THEME.accent}22`, border: `1px solid ${THEME.accent}`, color: THEME.accent, padding: '12px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px' },
  restoreBtn: { flex: 1, background: 'transparent', border: `1px solid ${THEME.warning}`, color: THEME.warning, fontSize: '0.6rem', cursor: 'pointer', padding: '8px', letterSpacing: '1px' },
  resetBtn: { flex: 1, background: 'transparent', border: `1px solid ${THEME.danger}`, color: THEME.danger, fontSize: '0.6rem', cursor: 'pointer', padding: '8px', letterSpacing: '1px' },
  lockedBox: { textAlign: 'center', padding: '40px 20px' }
};
