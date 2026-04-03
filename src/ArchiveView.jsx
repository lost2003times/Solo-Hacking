import React from 'react';

export default function ArchiveView({ log, setView }) {
  // Helper to map your existing "quality" state to your new UI colors
  const getQualityStyles = (quality) => {
    switch(quality) {
      case 'full': 
        return { label: 'OVERDRIVE', text: 'text-primary', border: 'border-primary/20', dot: 'bg-primary' };
      case 'reduced': 
        return { label: 'STABILIZED', text: 'text-tertiary', border: 'border-tertiary/20', dot: 'bg-tertiary' };
      case 'recovery': 
        return { label: 'RECOVERY', text: 'text-error', border: 'border-error/20', dot: 'bg-error' };
      default: 
        return { label: 'STANDARD', text: 'text-secondary', border: 'border-secondary/20', dot: 'bg-secondary' };
    }
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full h-[64px] bg-[#0A0A0A] border-b border-[#1A1A1A] z-50 flex justify-between items-center px-6">
        <div className="font-mono text-[14px] uppercase tracking-tighter text-white">
          SHADOW PROTOCOL
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => setView('hud')} className="text-[#888888] text-[14px] font-mono tracking-widest uppercase hover:text-white transition-colors duration-100 scale-95">Dashboard</button>
          <button className="text-white font-bold text-[14px] font-mono tracking-widest uppercase scale-95">Archive</button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setView('hud')} className="text-[#7F77DD] font-mono text-[12px] tracking-widest border border-[#7F77DD] px-3 py-1 hover:bg-[#7F77DD] hover:text-black transition-all">RETURN TO HUD</button>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-6 max-w-[1200px] mx-auto">
        {/* Header Section */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-mono text-3xl md:text-4xl font-extrabold tracking-tighter text-white mb-2">MISSION ARCHIVE</h1>
              <p className="text-outline text-sm font-label uppercase tracking-widest">Global operations historical database</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-10 flex flex-wrap items-center gap-4 py-4 border-y border-[#333333]">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              <button className="px-4 py-1.5 rounded-full bg-white text-black font-mono text-[10px] font-bold uppercase tracking-widest">All</button>
              <button className="px-4 py-1.5 rounded-full bg-surface-container-highest text-primary border border-outline-variant/15 font-mono text-[10px] font-bold uppercase tracking-widest hover:border-primary/50">Overdrive</button>
              <button className="px-4 py-1.5 rounded-full bg-surface-container-highest text-error border border-outline-variant/15 font-mono text-[10px] font-bold uppercase tracking-widest hover:border-error/50">Recovery</button>
            </div>
            <div className="flex-grow flex items-center gap-4">
              <div className="relative flex-grow max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                <input className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary rounded-lg pl-10 pr-4 py-2 font-mono text-xs text-white placeholder:text-outline/50 uppercase" placeholder="SEARCH LOGS..." type="text" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Log List */}
        <div className="mb-8 flex items-center gap-4">
          <h2 className="font-mono text-xs text-[#888888] font-bold tracking-[0.2em] whitespace-nowrap">RECENT ENTRIES — {log.length} TOTAL</h2>
          <div className="h-px w-full bg-[#333333]"></div>
        </div>

        <div className="space-y-0 relative">
          {log.length === 0 ? (
            <div className="text-center py-20 text-outline font-mono text-sm">NO DATA FOUND IN ARCHIVE.</div>
          ) : (
            log.map((entry, index) => {
              const styles = getQualityStyles(entry.quality);
              
              return (
                <div key={entry.id} className="flex gap-0 group">
                  {/* Streak Column */}
                  <div className="w-12 flex flex-col items-center">
                    <div className={`w-[2px] ${index === 0 ? 'h-4 bg-[#333333]' : 'h-full streak-solid'}`}></div>
                    <div className="w-3 h-3 rounded-full border-2 border-[#7F77DD] bg-[#0A0A0A] z-10"></div>
                    <div className={`w-[2px] flex-grow ${index === log.length - 1 ? 'bg-transparent' : 'streak-solid'}`}></div>
                  </div>

                  {/* Card Content */}
                  <div className="flex-grow pb-12">
                    <div className="bg-surface-container border border-outline-variant/10 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between group-hover:bg-[#252424] transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center gap-6 w-full">
                        <div className="min-w-[120px]">
                          <span className="font-mono text-xs font-bold text-white tracking-widest">{entry.date}</span>
                        </div>
                        <div>
                          <span className={`px-3 py-0.5 rounded-full bg-surface-container-highest ${styles.text} border ${styles.border} font-mono text-[9px] font-bold tracking-[0.15em]`}>
                            {styles.label}
                          </span>
                        </div>
                        <div className="flex-grow">
                          <ul className="flex flex-wrap gap-x-4 gap-y-1">
                            {entry.newsNote && (
                              <li className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                                <span className={`w-1 h-1 rounded-full ${styles.dot}`}></span> CYBER NEWS
                              </li>
                            )}
                            {entry.labNote && entry.labNote !== "N/A" && entry.labNote !== "Skipped" && (
                              <li className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                                <span className={`w-1 h-1 rounded-full ${styles.dot}`}></span> PENETRATION LAB
                              </li>
                            )}
                            {entry.academicNote && entry.academicNote !== "N/A" && entry.academicNote !== "Skipped" && (
                              <li className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                                <span className={`w-1 h-1 rounded-full ${styles.dot}`}></span> ACADEMIC PROTOCOL
                              </li>
                            )}
                            {entry.revisionNote && entry.revisionNote !== "N/A" && (
                              <li className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                                <span className={`w-1 h-1 rounded-full ${styles.dot}`}></span> REVISION PROTOCOL
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center gap-3">
                        <span className="text-[10px] font-mono text-primary font-bold">+{entry.xp} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Contextual Status Bar */}
      <footer className="fixed bottom-0 w-full bg-[#0E0E0E] py-2 px-6 border-t border-[#1A1A1A] flex justify-between items-center text-[9px] font-mono text-outline uppercase tracking-widest z-40">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> UPLINK STABLE</span>
          <span>NODE: ARCHIVE-SEC-01</span>
        </div>
        <div className="flex items-center gap-6">
          <span>TOTAL MISSIONS: {log.length}</span>
        </div>
      </footer>
    </div>
  );
}
