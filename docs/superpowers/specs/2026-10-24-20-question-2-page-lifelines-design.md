# Jain Quest: 2-Page 20-Question Game with Landing Screen, Lifelines & Instant Validation Design

## Overview
This design transforms the educational Jain matching game into a fast-paced 2-page arcade experience featuring:
1. **Landing Screen with Start Button**: No questions or timers visible on initial load. Features brand logos, game logo, rules, and animated Start button.
2. **2-Page Game (20 Questions Total)**: 10 questions on Page 1, followed by 10 questions on Page 2, with random selection from multiple bundled 20-question sets.
3. **Instant Validation (No Submit Button)**: Each placed card is evaluated immediately. Correct matches lock with checkmarks ($\checkmark$); incorrect matches shake ($\boldsymbol{\times}$), deduct 1 lifeline, and bounce back to the pool.
4. **Three Lifelines (❤️❤️❤️)**: Players start with 3 lives. If all 3 are lost, Game Over triggers.
5. **1-Minute Countdown Timer per Page**: 60 seconds for Page 1, and a fresh 60 seconds for Page 2. Reaching 0:00 triggers Game Over.
6. **Automatic Page Transition**: Solved Page 1 displays a 1.5-second celebratory banner, then automatically transitions to Page 2.
7. **Clean Header & Simplified UI**: Removal of JSON Manager, file upload, and custom dataset dropdowns. Everything is bundled in source. Returning to Landing Screen on Game Over.

---

## 1. Landing Screen Architecture

### 1.1 Layout & Visual Elements
- **Top-Left**: Jain Kosh brand logo (`jainkosh-logo.jpeg`) with text "जैन कोष".
- **Center Body**:
  - Large Jain Quest game logo (`game-logo.jpeg`) with soft elevation shadow.
  - Title: **JAIN QUEST (जैन कोष - तीर्थंकर एवं चिह्न मिलान)**.
  - **Rules & How to Play (खेलने के नियम)**:
    - 🎯 **20 प्रश्न (20 Questions)**: Page 1 (10 प्रश्न) + Page 2 (10 प्रश्न).
    - ⏱️ **1 मिनट प्रति पेज (60s Timer per Page)**: हर पेज के लिए 60 सेकंड का समय।
    - ❤️ **3 लाइफलाइन (3 Lifelines)**: हर गलत मिलान पर 1 लाइफलाइन कम होगी।
    - ⚡ **तुरंत परिणाम (Instant Check)**: बॉक्स में रखते ही तुरंत जांच।
    - 🔄 **गेम ओवर (Game Over)**: 3 लाइफलाइन समाप्त होने या समय पूरा होने पर गेम समाप्त होकर स्टार्ट स्क्रीन पर लौटेगा।
  - **"गेम शुरू करें (Start Game)" Button**: Large golden-amber button with animated breathing pulse.
- **State**: In landing mode (`gameState.screen === 'landing'`), no cards, targets, or timers are rendered or running.

### 1.2 Start Sequence
1. Player clicks "Start Game".
2. Audio context is unlocked and plays a rising start chime.
3. Game logo performs a quick scale/glow pop animation.
4. Landing container fades out; Game Playfield container fades in.
5. Randomly selects one of the pre-bundled 20-question datasets from source.
6. Initializes Page 1 (first 10 items) and starts the 60-second countdown timer.

---

## 2. In-Game Header & Controls

### 2.1 Header Components
- **Left**: Jain Kosh logo (`jainkosh-logo.jpeg`) with "जैन कोष" subtitle.
- **Center**: Jain Quest game logo (`game-logo.jpeg`) and title.
- **Right Controls**:
  - **Page Indicator**: `📄 Page 1 of 2` (or `Page 2 of 2`).
  - **Score**: `🎯 X / 20`.
  - **3 Lifelines**: 3 heart icons (`❤️❤️❤️`), turning to `💔`/`🖤` as lives are lost.
  - **Countdown Timer**: 60-second countdown (`0:59` to `0:00`). Ticks red with audio warning pulses at $\le 10$ seconds.
  - **Sound Toggle**: Mute / Unmute.
  - **Fullscreen Toggle**: Expand to full screen.
- **Removed Elements**: JSON Manager button, dropdown dataset selector, New Game button, and Submit Answers button are all removed.

---

## 3. Instant Validation & Lifeline Engine

### 3.1 Card Assignment Mechanics
When a card is placed in a drop slot:
- **Correct Match**:
  - Card snaps into place with `.snap-pop`.
  - Elastic checkmark ($\checkmark$) stamps onto card.
  - Ascending bell chime sounds.
  - Card is locked (`draggable = false`, cannot be picked up again).
  - Score increments by 1 (`gameState.score++`).
  - If all 10 cards on Page 1 are locked $\rightarrow$ triggers Page 1 completion.
  - If all 10 cards on Page 2 are locked $\rightarrow$ triggers Full Victory.
- **Incorrect Match**:
  - Card displays red cross ($\boldsymbol{\times}$) and horizontal wobble shake (`.shake-wrong`).
  - Error thud sound plays.
  - Lifelines decremented (`gameState.lives--`). Active heart icon breaks/greys out.
  - Card automatically bounces back into the unplaced dock/pool after 400ms, leaving the slot empty for another attempt.
  - If `gameState.lives === 0` $\rightarrow$ Game Over triggers immediately.

---

## 4. Multi-Page Progression (20 Questions Total)

### 4.1 Page 1 to Page 2 Transition
1. Page 1 matches questions 1–10.
2. Upon matching the 10th card:
   - Timer stops.
   - Victory chime plays.
   - 1.5-second celebratory banner appears: `Page 1 Complete! 🎉 शानदार! Page 2 शुरू हो रहा है...`.
   - Engine initializes Page 2 with questions 11–20 from the active dataset.
   - Pool and target grid re-render with the new 10 items.
   - Timer resets to 60 seconds and resumes countdown.
   - Carried-over lifelines remain active.

### 4.2 End Conditions
- **Game Over (Lives = 0 or Timer = 0:00)**:
  - Audio: Game over descending tones.
  - Modal: Shows reason ("3 गलत उत्तर / 3 Lives Lost" or "समय समाप्त / Time's Up"), final score out of 20, and a **"Start Screen (स्टार्ट स्क्रीन)"** button.
  - Clicking returns to the Landing Screen with clean state.
- **Full Victory (Score = 20 / 20)**:
  - Audio: Arpeggiated victory fanfare.
  - Visual: Fullscreen HTML5 Canvas confetti shower.
  - Modal: Celebratory badge "🏆 जय जिनेन्द्र! अद्भुत प्रदर्शन!", total time taken, and "Play Again" button returning to Landing Screen.

---

## 5. Pre-Bundled Datasets in Source
The source file will contain multiple complete 20-question datasets:
- **Dataset 1 (Video Set 1 & 2 Combined - 20 Tirthankaras)**:
  - Page 1: कुंथुनाथ, धर्मनाथ, सुमतिनाथ, महावीर, चंद्रप्रभ, आदिनाथ, श्रेयांसनाथ, पार्श्वनाथ, पद्मप्रभु, संभवनाथ.
  - Page 2: शीतलनाथ, अभिनंदननाथ, वासुपूज्य, विमलनाथ, सुपार्श्वनाथ, शांतिनाथ, अनंतनाथ, पुष्पदंत, मुनिसुव्रतनाथ, अजितनाथ.
- **Dataset 2 (Canonical Chronological Sequence - 20 Tirthankaras)**:
  - Page 1: 1st to 10th Tirthankaras (आदिनाथ भगवान to शीतलनाथ भगवान).
  - Page 2: 11th to 20th Tirthankaras (श्रेयांसनाथ भगवान to मुनिसुव्रतनाथ भगवान).
- **Dataset 3 (Reverse & Classic Mixed 20 Tirthankaras)**:
  - Page 1 & 2 covering 20 Tirthankaras in distinct pairings.
- On each click of "Start Game", the engine randomly picks one of these 20-question sets.
