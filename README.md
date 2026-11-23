# The Detective's Desk: Noir Murder Mystery Game 🕵️‍♂️🔍

A complete, full-stack Next.js (App Router, TypeScript, Tailwind CSS) murder mystery game powered by the **Groq SDK** and OpenAI open-source models (`openai/gpt-oss-120b` and `openai/gpt-oss-20b`).

---

## 🏛️ Core Architecture & Security Guardrails

- **Zero Client-Side Leakage**: All case dossiers, secret suspect system prompts, motive trees, and the ground-truth solution are kept strictly on the server (`src/data/caseData.ts` and `src/lib/caseStore.ts`).
- **Sanitized Public API**: The client only receives sanitized public dossiers (`name`, `role`, `public_bio`, `description`). Suspect `secret_system_prompt` strings and `is_killer` flags are stripped on the server before reaching the browser.
- **Model Specialization**:
  - `openai/gpt-oss-120b`: Powers suspect interrogation dialogues, JSON-structured stress/pulse analysis, final Chief of Police verdict grading, and the dynamic mystery case generator.
  - `openai/gpt-oss-20b`: Powers rapid, clinical forensic spectrometry and digital crime lab analysis.

---

## 🎮 Key Features

### 1. Case File Dashboard (Film Noir Police Dossier)
- **Homicide Incident Report**: Victim details for Julian Vance (Tech Billionaire & Collector poisoned in his private study).
- **Physical Evidence Tags**:
  1. *Shattered Smart Watch* (Stopped at 11:12 PM, heart rate peaked at 145 BPM).
  2. *Half-Burned NDA Document* (Recovered from fireplace, mentions "Project Helios" and 40% equity clawback).
  3. *Traces of Bitter Almond Oil* (Rim of the martini glass, matching organic pesticide used in rare orchids).
- **Suspect Lineup**:
  - Elena Rostova (Co-Founder & CTO)
  - Marcus Thorne (Personal Sommelier & Botanist)
  - Chloe Sterling (Investigative Journalist)
- **12-Action-Point Budget**: Creates investigative tension (1 AP per suspect interrogation question, 2 AP per forensic scan).
- **Persistent Detective's Field Notebook**:
  - Auto-saved to `localStorage` per case.
  - Type hypotheses or click the 📌 **Pin** button on any suspect message to automatically bookmark quotes with suspect attribution and timestamps.

### 2. Live Suspect Interrogation Room (`/api/interrogate`)
- Multi-turn tabbed chat maintaining separate histories per suspect.
- **Present Evidence Button**: Seamlessly injects `[DETECTIVE PRESENTS EVIDENCE: <Clue Name> - <Clue Description>]` into the interrogation, forcing suspects to react defensively.
- **Real-Time Suspect Stress & Pulse Meter**:
  - JSON output returns `{ "reply": string, "nervousness": number }`.
  - Visual pulse bar from calm green (20%) to agitated amber (50%) to panicked red (80%+).
  - Synthesized Web Audio heartbeat sound increases in tempo as suspects crack under pressure.

### 3. Forensic Clue Analyzer (`/api/forensics`)
- Crime lab evaluation powered by `openai/gpt-oss-20b`.
- Returns `{ "relevance_score": number, "possible_owners": string[], "analysis": string, "followup_question": string }`.
- Includes a "Confront Suspect in Interrogation" button that automatically transfers the lab's recommended follow-up question directly into the interrogation input.

### 4. Final Accusation & Chief of Police Verdict (`/api/verdict`)
- Modal to select the prime suspect and enter the detective's theory, motive, and method.
- Graded against ground truth by Chief Inspector Henderson.
- Dramatic rubber-stamp animations:
  - 🟢 **CASE SOLVED** (Accused true killer Marcus Thorne + correct deduction, accompanied by confetti celebration).
  - 🔴 **CASE DISMISSED** (Accused innocent party or failed deduction with Chief's critique).

### 5. Bonus Solvable "New Mystery" Generator (`/api/generate-case`)
- Generates an entirely new, airtight 3-suspect murder mystery using `openai/gpt-oss-120b`.
- Generates a unique victim, 3 physical clues, 1 killer, 2 innocent red-herrings with full secret system prompts, and a ground-truth solution stored securely on the server.

### 6. Interactive Onboarding Walkthrough (`driver.js`)
- **Auto-Launch with Persistence**: Automatically launches on first load after a 600ms render delay and stores `detectives_desk_tour_done: "true"` in `localStorage` upon completion or exit.
- **Top Header "Guide" Replay**: Replay the walkthrough anytime with the HelpCircle guide button in the header.
- **Film Noir Styling**: Styled with dark slate container (`#0f172a`), amber/gold borders, monospace accents, custom step counters, and vintage buttons.
- **7 Guided Steps**: Introduces the crime scenario, Action Points economy, Evidence & Forensic Scans, Suspect Interrogation Chamber, Field Notebook, Infinite AI Mystery generation, and the final Chief of Police accusation.


---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- Groq API Key ([https://console.groq.com](https://console.groq.com))

### 2. Configure Environment Variable
Create `.env.local` in the project root:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```
*(Alternatively, you can click the "API Key" button directly in the in-game header to provide your key securely via client session storage)*.

### 3. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
```bash
npm run build
npm start
```
