# Jain Quest Matching Game - UI/UX, Video Feedback & Navigation Improvement Design

## Overview
This design improves the single-file educational matching web game [jain_quest_matching_game.html](file:///d:/Users/viren/Documents/JainKosh/games/jain_quest_matching_game.html). The game challenges players to match 10 Jain Tirthankara names with their authentic auspicious signs (Lānchhana).

The improvements focus on four key areas:
1. **Multi-Dataset Pool with Random Start**: Always a single 10-item round, randomly picking from available datasets (video sets, authentic sets, or uploaded JSON files) on startup and restart.
2. **Authentic Video Feedback (Wordwall Aesthetics)**: Replicating the sequential evaluation flow, stamping animations ($\checkmark$ and $\boldsymbol{\times}$), slate-grey incorrect card states, card wobble, and celebration confetti.
3. **Mobile Sticky Dock & Responsive Architecture**: Eliminating vertical scrolling between cards and targets on small screens via a collapsible bottom sticky drawer.
4. **Intuitive Navigation**: Clear top and bottom navigation controls, instant "New Random Game" action, and an enhanced post-game results modal with "Show Answers" review mode.

---

## 1. Multi-Dataset Pool & Random Game Selection

### 1.1 Dataset Architecture
The game operates in **Single Set Mode** (10 matching pairs per session). It maintains a library of pre-packaged datasets and dynamically loaded datasets:

* **Built-in Set 1 (Video Page 1 - 10 Tirthankaras)**:
  * कुंथुनाथ भगवान $\rightarrow$ बकरा
  * धर्मनाथ भगवान $\rightarrow$ वज्रदंड
  * सुमतिनाथ भगवान $\rightarrow$ चकवा
  * महावीर भगवान $\rightarrow$ सिंह
  * चंद्रप्रभ भगवान $\rightarrow$ चंद्रमा
  * आदिनाथ भगवान $\rightarrow$ बैल
  * श्रेयांसनाथ भगवान $\rightarrow$ गेंडा
  * पार्श्वनाथ भगवान $\rightarrow$ सर्प
  * पद्मप्रभु भगवान $\rightarrow$ लाल कमल
  * संभवनाथ भगवान $\rightarrow$ घोड़ा

* **Built-in Set 2 (Video Page 2 - 10 Tirthankaras)**:
  * शीतलनाथ भगवान $\rightarrow$ कल्पवृक्ष
  * अभिनंदननाथ भगवान $\rightarrow$ बंदर
  * वासुपूज्य भगवान $\rightarrow$ भैंसा
  * विमलनाथ भगवान $\rightarrow$ शूकर
  * सुपार्श्वनाथ भगवान $\rightarrow$ स्वस्तिक
  * शांतिनाथ भगवान $\rightarrow$ हिरण
  * अनंतनाथ भगवान $\rightarrow$ सेही
  * पुष्पदंत भगवान $\rightarrow$ मगर
  * मुनिसुव्रतनाथ भगवान $\rightarrow$ कछुआ
  * अजितनाथ भगवान $\rightarrow$ हाथी

* **Built-in Set 3 (Authentic JSON Standard)**:
  * Authentic lanchhans for 10 primary Tirthankaras.

* **User Uploaded Sets**:
  * Users can upload multiple `.json` files simultaneously via the Data Manager modal.
  * Each file containing an array of `{"godname": "...", "sign": "..."}` is added to the active dataset pool.

### 1.2 Random Selection Engine
* When the game loads or when **"New Game (🎲 Random Set)"** is clicked:
  * The game randomly chooses one dataset from the pool.
  * If a dataset contains more than 10 items, 10 items are chosen randomly or sliced.
  * Cards are shuffled and drop targets are independently shuffled.
  * A brief visual toast/pill informs the player of the active set (e.g. `🎲 Set: Video Set 1`).

---

## 2. Responsive Layout & Mobile Sticky Dock

### 2.1 Viewport Breakpoints
* **Desktop / Large Screens (`>= 1024px`)**:
  * Dual-column classroom chalkboard layout:
    * Left Pool: 2 columns $\times$ 5 rows of vibrant Tirthankara cards.
    * Right Target Area: 2 columns $\times$ 5 rows of `[Drop Box] + [Sign Label]`.
  * Preserves background SVG classroom artwork.

* **Mobile / Tablet Screens (`< 1024px`)**:
  * **Main Content Area**:
    * Vertical scrollable target list containing the 10 sign rows.
    * Bottom padding (`pb-36`) ensures target slots are never obscured by the dock.
  * **Sticky Bottom Dock Drawer**:
    * Fixed to the bottom of the viewport (`fixed bottom-0 inset-x-0 z-40`).
    * Frosted glass backdrop (`bg-stone-900/95 backdrop-blur-md border-t border-amber-600/40`).
    * **Dock Header Bar**:
      * Remaining cards counter: `✨ X शेष (X remaining)`
      * Collapse / Expand toggle button (`▲ Expand / ▼ Rail`).
    * **Compact Rail Mode (Default)**:
      * Horizontal swipeable card track with smooth momentum scroll (`overflow-x-auto no-scrollbar`).
      * High-density cards easily accessible with one thumb.
    * **Expanded Tray Mode**:
      * 2-row grid displaying all unplaced cards simultaneously.
    * **Auto-Collapse**: When all 10 cards have been placed onto the board, the dock smoothly minimizes to 0 height, bringing full attention to the "Submit Answers" button.

---

## 3. Interaction & Touch Engine

### 3.1 Tap-to-Place (One-Handed Mobile Friendly)
1. **Selection**:
   * Tapping any card in the pool/dock selects it.
   * Active card displays an amber pulsing glow halo (`selected-card`).
2. **Placement**:
   * Tapping any drop slot or sign label places the selected card into that slot with a micro-snap animation.
3. **Displacement / Swap**:
   * If a slot is already occupied, placing a new card either swaps places or sends the previous occupant back to the dock/pool.
4. **Recall**:
   * Tapping an already placed card removes it from the slot and returns it to the unplaced cards dock.

### 3.2 Pointer & Drag Engine
* Unified pointer events (`pointerdown`, `pointermove`, `pointerup`) with `setPointerCapture`.
* Supports desktop HTML5 drag & drop and mobile touch drag.
* Floating ghost element (`#drag-ghost`) mirrors card colors and Devanagari text with drop shadow and touch elevation.
* Visual slot hover ring (`drag-over`) guides precision placement.

---

## 4. Video Feedback & Animation System

### 4.1 Wordwall-Style Sequential Grading
* Triggered upon clicking **Submit Answers**:
  * All user interactions are locked during evaluation (`isEvaluating = true`).
  * Evaluates slots sequentially: Left column items (0, 2, 4, 6, 8) then Right column items (1, 3, 5, 7, 9) with a 260ms cadence.
  * Active slot receives a focus ring highlight.
  * **Correct Match**:
    * Circular green badge with checkmark ($\checkmark$) stamps onto card via `badge-pop` elastic animation.
    * Sharp bell chime sounds via Web Audio API.
    * Score counter increments with bounce animation (`scale(1.25)` $\rightarrow$ `scale(1.0)`).
  * **Incorrect Match**:
    * Cross mark ($\boldsymbol{\times}$) stamps onto card.
    * Card undergoes a subtle wobble/shake animation (`shake-wrong`).
    * Card transitions to authentic slate-grey background (`#8e8e8e`) with dark border (`#3a3a3a`).
    * Dull error thud sounds via Web Audio API.

### 4.2 Celebration Confetti
* Full-screen overlay `<canvas id="fx-canvas">` with `pointer-events: none`.
* Pure vanilla JavaScript physics engine (zero external dependencies).
* Emits ~120 multi-colored confetti particles with gravity, wind drift, rotation, and opacity decay.
* Triggers when evaluation finishes with full marks (10/10) or upon complete game submission.

### 4.3 Synthesized Web Audio
* Self-contained Web Audio API (cross-browser compatible, unlocked on first user tap):
  * Card pickup: short ascending chirp.
  * Card drop / slot snap: warm wooden thud.
  * Correct match: high harmonic bell chime.
  * Wrong match: low sawtooth buzz.
  * Game victory / fanfare: multi-voice arpeggiated victory chord.
  * Mute / unmute toggle button in header.

---

## 5. Navigation & Screen Flow

### 5.1 Header Navigation Bar
* **Live Timer Display** (`0:00`).
* **Game Logo** and **Jain Kosh Logo** (with local image load support and inline SVG fallbacks).
* **New Game (🎲 Random)**: One-click button to immediately select a fresh dataset from the pool and start a new single round.
* **Sound Toggle**: Speaker icon with visual muted/unmuted state.
* **Fullscreen Toggle**: Expand to full display mode.
* **JSON / Settings**: Opens modal to view, upload, or manage JSON datasets.
* **Live Score Badge**: Animated score counter with checkmark indicator.

### 5.2 Bottom Action Bar
* **Restart Button**: Resets the current round with cards returning to the pool/dock.
* **Submit Answers Button**: Validates all placed cards.
* **Show Correct Answers Button**: Appears after submission; fills all slots with correct cards and stamps $\checkmark$ for learning and review.

### 5.3 Results Modal
* Displays upon evaluation completion:
  * Final score (e.g. `10 / 10`) with trophy icon.
  * Time taken.
  * **🎲 Next Random Game**: Starts a fresh round with a different random dataset.
  * **🔄 Play Again**: Restarts the same dataset for practice.
  * **👁️ Review Board**: Closes the modal to inspect placed cards and stamps on the board.

---

## 6. Error Handling & Edge Cases
* **Invalid JSON uploads**: Validates JSON schema (`array` of objects with `godname` and `sign` strings) and provides red alert feedback in the modal without breaking the game state.
* **Window resizing**: Adapts seamlessly between desktop dual-column and mobile sticky dock without resetting card positions.
* **Audio context suspension**: Automatically resumes audio context upon first user gesture in compliance with browser autoplay policies.
* **Touch scrolling vs dragging**: Drag initiation requires moving beyond an 8px threshold, preventing accidental drag starts during normal scrolling.
