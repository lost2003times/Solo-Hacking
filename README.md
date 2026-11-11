# Solo Hacking: Cyber Learning Tracker

A daily accountability tracker for studying cybersecurity, styled like a system monitor. You log real work every day, earn XP, level up through ranks, and lose progress if you go quiet.

**Live demo:** https://vite-react-three-lilac-76.vercel.app

## How it works

**Daily report.** Each day you submit a report in one of three modes:

| Mode | XP multiplier | What you log |
| --- | --- | --- |
| Overdrive | 1.0x | Lab work (findings or exploits) and academic study, 50 XP each |
| Stabilized | 0.6x | The same tasks on a lighter day |
| Regen / Revision | 0.4x | Revising past concepts. Uses one of 5 monthly recovery cells. |

A security news headline adds 10 XP in every mode. Text fields need a minimum length, so a box can't be ticked without writing anything.

**Levels and ranks.** Every 150 XP is a level. Ranks go from E-Class to S-Class (level 50 and up).

**Missing days costs you.** Go more than 36 hours without a report and the streak resets. You also lose 40 XP and gain 2 penalty points for each missed day.

**Mission archive.** A log of every report, with what you studied and the XP it earned.

**Backup.** Progress is saved in the browser's `localStorage`. You can export it to a JSON file and import it back, for example when moving to another browser.

## Tech

React 18, TypeScript and Vite, deployed on Vercel. There's no backend and no account.

## Running locally

```bash
npm install
npm run dev
```
