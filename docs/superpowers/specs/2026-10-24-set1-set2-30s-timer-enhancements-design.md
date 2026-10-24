# Jain Quest Game Enhancements Design: Set-1 & Set-2, 30s Countdown, 3 Lives, BG Music & Exit Button

## Overview
This design upgrades the Jain Quest educational matching game with:
1. **Source Datasets (`set-1.json` & `set-2.json`)**: Pre-bundled with `{ "question": "...", "answer": "..." }` schema. At game start, randomly picks between Set 1 and Set 2.
2. **Page 1 (First 10 Questions) & Page 2 (Next 10 Questions)**: Questions 0–9 on Page 1, questions 10–19 on Page 2, with randomized card sequence and randomized slot sequence.
3. **30-Second Countdown Timer (30 to 0)**: Large, prominent font size (`text-3xl sm:text-4xl`), ticking from 30 down to 0 for each page.
4. **3 Lives (❤️❤️❤️)**: Wording updated to "Life" (not "Lifeline"). 3 hearts displayed; game ends after 3 wrong matches.
5. **Continuous Background Music**: Ambient synthesized melodic sound loop that plays softly while playing, pauses on game over/victory/landing, and respects the mute toggle.
6. **Dramatic Game Over Sound**: Distinctive descending minor tone chord when game ends.
7. **Exit Button While Playing**: Header "Exit" button to return to the Home/Landing screen at any time.
8. **UI Polish**: Removed "How to Play" helper banner from gameplay; Game Over popup button renamed to "Home".

---

## 1. Data Schema & Page Splitting

### 1.1 Dataset Schema
```json
[
  { "question": "...", "answer": "..." }
]
```
- **Set 1 (`set-1.json`)**: 20 items (Tirthankaras & signs/Lanchhans).
- **Set 2 (`set-2.json`)**: 20 items (Tirthankaras/Heroes & Nirvana Kshetras, Acharyas & Granthas).

### 1.2 Splitting & Shuffling Logic
- When a game starts:
  - Randomly choose Set 1 or Set 2 (avoiding immediate repetition).
  - **Page 1**: Slices items `0` through `9` (first 10 items).
    - Draggable Cards: Shuffled order of the 10 questions.
    - Target Slots: Independently shuffled order of the 10 answers.
  - **Page 2**: Slices items `10` through `19` (next 10 items).
    - Draggable Cards: Shuffled order of the 10 questions.
    - Target Slots: Independently shuffled order of the 10 answers.

---

## 2. Timer, Lives & Header Layout

### 2.1 30-Second Countdown Display
- Display format: Single integer countdown running from `30` down to `0`.
- Styling: Large, high-visibility typography (`text-3xl sm:text-4xl font-extrabold text-amber-300 font-mono`).
- Warning state: At $\le 10$ seconds, timer turns red (`text-red-500 animate-pulse`) with warning audio clicks.
- Expiration: At `0`, calls `triggerGameOver('timeout')`.
- Fresh 30 seconds awarded on Page 2 start.

### 2.2 3 Lives Display
- Header displays `3 Life` with 3 heart icons: `❤️❤️❤️`.
- When an incorrect card is dropped:
  - Deducts 1 life (`gameState.lives--`).
  - Active heart breaks/turns grey (`🖤`).
  - Card shakes (`shake-wrong`), plays error thud, and bounces back to dock.
  - If lives reach 0 $\rightarrow$ calls `triggerGameOver('lives')`.

### 2.3 Header Controls
- **Left**: Jain Kosh brand logo (`jainkosh-logo.jpeg`) with text.
- **Center**: Jain Quest game logo & title.
- **Right Controls**:
  - Page indicator: `Page 1 of 2` (or `Page 2 of 2`).
  - Score badge: `🎯 X / 20`.
  - Lives: `❤️❤️❤️`.
  - Timer: `30`s countdown.
  - **Exit Button**: `🚪 Exit` button returning player to the Home landing screen.
  - Sound mute/unmute & Fullscreen toggles.

---

## 3. Web Audio Synthesis: Ambient Background Music & Game Over

### 3.1 Continuous Background Music Engine
- Implemented via pure Web Audio API (zero external assets or network requests).
- Synthesizes a gentle, ambient looping arpeggio (soft sine/triangle waves with gentle filter cutoff) that plays continuously during active gameplay.
- Automatically stops/mutes when:
  - Game is paused.
  - Player returns to Home screen.
  - Game Over or Victory triggers.
  - Sound is toggled off (`soundEnabled === false`).

### 3.2 Dramatic Game Over Sound
- Synthesizes a descending minor triad/seventh sequence (e.g. Eb4 $\rightarrow$ C4 $\rightarrow$ G3 $\rightarrow$ C3) with rich harmonic decay and soft low gong thud.

---

## 4. UI Polish & Modals
- Removed `#helper-banner` ("How to Play") from gameplay; rules are prominently shown only on the Landing/Home screen.
- Game Over modal button labeled **"Home (होम)"**.
- Victory modal button labeled **"Home (होम)"**.
