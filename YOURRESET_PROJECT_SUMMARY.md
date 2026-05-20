# YourReset — Project Summary
> For design and development handoff. Last updated: May 2026. Commit: `3b0b4b8`

---

## What the app is

**YourReset** is a premium women's fitness and wellness app that adapts workouts to hormonal cycle phases. It also supports male and non-cycle users with goal-based adaptive plans.

Core differentiator: **no mainstream competitor offers true cycle-aware workout programming.** YourReset calculates the user's current phase from their reported cycle start date and adjusts exercise intensity, sets/reps guidance, coaching copy, nutrition nudges, and equipment-aware swaps in real time.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 19.2 |
| Build | Vite 8 |
| Styling | Vanilla CSS (custom design system in `index.css`) + inline styles |
| 3D | React Three Fiber 9.6, Three.js 0.174, @react-three/drei 10 |
| Storage | localStorage only (no backend) |
| Video API | Higgsfield image-to-video (platform.higgsfield.ai) |
| Font | Inter (Google Fonts) |

---

## File structure

```
src/
  App.jsx                   — thin shell: state, routing, nav (192 lines)
  Onboarding.jsx            — 3-step wizard: name/goal, gender/cycle, equipment
  main.jsx                  — React root
  index.css                 — full design system (CSS tokens, component classes)
  theme.js                  — T object (legacy, being migrated out)
  storage.js                — localStorage get/set, week/day key helpers
  cycleEngine.js            — phase calculation, PHASES content, PCOS guidance
  workoutData.js            — WEEK_PLAN, EQUIPMENT_MAP, SUBSTITUTIONS, SWAP_LIBRARY, SWAP_LIBRARY_BANDS
  nutritionEngine.js        — NUTRITION_PHASES, GOAL_NUTRITION, nudges
  gutEngine.js              — gut score, check-in fields, triggers, RED_FLAGS
  higgsfieldApi.js          — Higgsfield image-to-video API client

  components/
    PlanTab.jsx             — Today screen: hero card, stats strip, readiness, day chips, exercise list
    MetricsTab.jsx          — Progress: rings, step history, stat cards
    CycleTab.jsx            — Cycle: phase hero, cycle map, PCOS toggle, phase guide
    NutritionTab.jsx        — Fuel: phase-based or goal-based nutrition cards
    GutResetTab.jsx         — Gut: daily check-in, score, triggers, content cards
    SettingsPage.jsx        — Profile, equipment, cycle, data export/clear
    PricingPage.jsx         — Pricing tiers (placeholder)
    ReadinessCheck.jsx      — 3-field check-in: energy, sleep, soreness
    ExerciseModal.jsx       — Exercise detail: 2D anim, logger, Higgsfield video
    WorkoutLogger.jsx       — Per-set weight/reps/RPE inputs, progressive overload ref
    ExerciseAnimation.jsx   — SVG stick-figure animations (25+ exercise types)
    Exercise3DPreview.jsx   — Three.js canvas: camera presets, animation map, mannequin
    FBXMannequin.jsx        — Mixamo FBX character loader (lazy, opt-in)

  public/
    models/animations/
      bicep-curl.fbx
      burpee.fbx
      jogging.fbx
      situp.fbx
      start-plank.fbx
```

---

## Design system

### Color tokens (`index.css` `:root`)

```css
--yr-bg:       #0f0c12;       /* warm dark background */
--yr-card:     rgba(255, 248, 244, 0.06);  /* warm-tinted glass card */
--yr-border:   rgba(255, 248, 244, 0.10);
--yr-text:     #fff7f0;       /* cream white */
--yr-muted:    #aaa0a8;
--yr-faint:    #6e6670;

/* Phase accent — overridden via JS per cycle phase */
--phase-accent: #d98aa8;
--phase-soft:   rgba(217, 138, 168, 0.14);
--phase-border: rgba(217, 138, 168, 0.26);

/* Fixed palette */
--yr-rose:   #d98aa8;
--yr-violet: #b79cff;
--yr-sage:   #9bd8b4;
--yr-amber:  #f2bd73;
--yr-blue:   #8cc8ff;
--yr-red:    #f87171;
```

### Phase accent colors (set on `document.documentElement` via JS)

| Phase | Accent | Label |
|---|---|---|
| Menstrual | `#d98aa8` rose | Restore & Renew |
| Follicular | `#9bd8b4` sage | Build & Challenge |
| Ovulatory | `#f2bd73` amber | Peak & Power |
| Luteal early | `#b79cff` violet | Stabilize & Sustain |
| Luteal late | `#b79cff` violet (muted) | Wind Down |
| Non-cycle | `#8cc8ff` blue | Training Focus |

### Key CSS classes

| Class | Purpose |
|---|---|
| `.app-shell` | Max 430px centered mobile shell |
| `.app-header` | Sticky top, blur backdrop |
| `.yr-header` | Header inner layout (name + date + day pill) |
| `.today-card` | 2-column hero: copy left, avatar right |
| `.phase-card` | Phase info card with gradient + phase border |
| `.stats-strip` | Inline stat row (no boxes) |
| `.exercise-row` | Flat list exercise card |
| `.week-day` | Day chip (Today/Mon/Tue…) with date |
| `.readiness-card` | Compact readiness row |
| `.bottom-nav` | Fixed floating pill nav bar |
| `.nav-btn` | Nav item, `.active` state |
| `.glass-card` | Generic glassmorphism card |
| `.btn-primary-full` | Phase-accent CTA button |
| `.chip` / `.chip.active` | Multi-select chips (equipment, goals) |

### Typography

- Font: **Inter** (Google Fonts, weights 300–900)
- App title: 22px, 800 weight, `-0.04em` tracking
- Workout title: `clamp(24px, 6vw, 30px)`, 800 weight
- Body: 13–15px, `line-height: 1.5`
- Labels: 11px, 700 weight, uppercase, `0.07em` tracking
- Muted: `var(--yr-muted)` `#aaa0a8`

---

## Navigation

Bottom floating nav, 5–6 items depending on profile:

```
◈ Today   ↗ Progress   ◎ Cycle   ✦ Fuel   ○ Gut   ≡ You
```

- **Cycle** tab hidden if `profile.cycleTracking === false`
- Nav is a floating pill: `position: fixed; bottom: 16px; backdrop-filter: blur(28px)`
- Active state: white text + subtle white background chip

---

## Onboarding flow

3 steps:
1. **Name + Goal** — fat_loss / strength / wellness / endurance
2. **Gender + Cycle** — female → shows cycle tracking option (date + length slider 21–45 days); male/other → skips cycle
3. **Equipment** — multi-select chips: bodyweight, dumbbells, barbell, bands, kettlebell, machines, cable, cardio

Profile stored in `localStorage` as `yr_profile`:
```js
{
  name, goal, gender,
  cycleTracking: boolean,
  cycleStartDate: "YYYY-MM-DD",  // null if no tracking
  cycleLength: 28,               // user-adjustable in Cycle tab
  equipment: ["dumbbells", "machines", "cardio"]
}
```

---

## Today tab (PlanTab)

Layout order:
1. **Today hero card** — 2-column: workout name + phase copy + sets guidance + Start button (left), ExerciseAnimation SVG (right)
2. **Stats strip** — `0/7 exercises · 0 / 330 kcal · 0% complete`
3. **Readiness check-in** — energy (1–5), sleep (Poor/Ok/Good), soreness (None/Mild/High)
4. **Day selector** — scrollable chips with dates (Today May 3 / Mon May 4…)
5. **"Up next" section** — flat exercise list with index number, name, sets, muscle, type, kcal badges

### Exercise cards

Each row shows:
- `01` index (turns `✓` when done)
- Exercise name + sets × muscle
- Type badge + kcal badge
- `⚠️ No cable` warning badge if equipment missing
- `Try: Diamond push-ups · Swap →` button if `SWAP_LIBRARY[exId]` exists
- `Swapped` badge + `↩ Restore original` if swapped

### Equipment swap system

Three-tier lookup on "Swap →" tap:
```
hasBands && SWAP_LIBRARY_BANDS[exId]   → band alternative
  || SWAP_LIBRARY[exId]                → bodyweight alternative
```

Coverage: 24 exercises across cable, dumbbell, kettlebell, and cardio categories.

### Set logging (WorkoutLogger)

Inside exercise modal:
- Per-set weight + reps + RPE inputs
- `Last week: 12 × 15 @7` reference from `yr_log_<prevWeek>_<day>_<exId>`
- `↑ Try more load today` if previous RPE ≤ 7 and all sets done
- Saves to `yr_log_<weekKey>_<dayIndex>_<exId>`

---

## Cycle tab (CycleTab)

Sections:
1. **Current phase hero** — phase emoji + label, Day X of Y, honest coaching tip, intensity/sets/cardio chips, "calendar estimate" confidence note
2. **PCOS / irregular toggle** — reveals HIIT+combined training evidence, 120 min/week guideline
3. **Cycle length stepper** — `−` / `32 days` / `+` (range 21–45, persists to profile)
4. **Your cycle map** — dynamic strip (actual user cycle length, all windows recalculated)
5. **Phase guide** — 5 expandable cards (tap to open):
   - Menstrual: prostaglandin activity + iron/omega-3/magnesium
   - Follicular: honest McMaster 2025 caveat
   - Ovulatory: ACL mechanism explained (E2 → laxity with 2–3 day delay)
   - Luteal early: protein timing, Zone 2 fat oxidation
   - Luteal late: BMR +200–500kcal physiology, PMS aerobic evidence (SMD=−0.81)
6. **Research disclaimer** footer

### Phase window calculation

Ovulation estimated at `cycleLength - 14`. For a 32-day cycle:
- Menstrual: 1–5 (fixed)
- Follicular: 6–17
- Ovulatory: 18–20
- Luteal early: 21–27
- Luteal late: 28–32

---

## Fuel tab (NutritionTab)

- Female cycle-tracking users → `NUTRITION_PHASES[phase]` (5 phases × protein/carbs/hydration/keyNutrients/cravings/mealIdeas)
- Male / non-cycle users → `GOAL_NUTRITION[goal]` (fat_loss/strength/wellness/endurance/muscle_tone/flexibility)
- Hero card: daily nudge + phase/goal label
- 2×2 grid: Protein · Carbs · Hydration · Key Nutrients
- Cravings card + Meal ideas list
- Medical disclaimer footer

---

## Gut Reset tab (GutResetTab)

MVP wellness tracking (not diagnostic):
1. **Daily rotating nudge** (8 nudges, rotates by day of week)
2. **Gut comfort score** (0–100 wellness indicator, appears after 4+ check-in fields)
3. **Daily check-in** — 6 fields: bloating, stomach comfort, bathroom, energy after meals, hydration, stress
4. **Trigger tracker** — 15 multi-select chips + free-text note
5. **Content cards** — Fiber, Fermented foods, Prebiotic foods, Probiotic reality check (collapsible)
6. **Red flag safety card** — 8 symptoms directing to clinician

Gut log stored as `yr_gut_<date>` in localStorage.

---

## Exercise modal (ExerciseModal)

Opened by tapping any exercise row:
1. **2D animation** (ExerciseAnimation SVG, instant) with `▷ 3D` button overlay
2. Phase note (e.g. "Lighter weight today" for low-intensity phase)
3. Sets / Reps display
4. Coach tip
5. **Workout logger** (weight/reps/RPE per set, previous week reference)
6. **Motion demo section** (Higgsfield image-to-video, opt-in)
   - "Animate exercise demo" button
   - "Saved demo" badge if cached in localStorage
   - Fallback: shows coach tip if Higgsfield fails

### 3D opt-in path

Tapping `▷ 3D` lazy-loads the Three.js chunk (~880KB) then renders either:
- **Primitive mannequin** — gender-specific (female: ponytail, sports bra in phase accent, leggings; male: short hair, dark tank, shorts, bare shins)
- **FBX character** — Mixamo Xbot with 5 real animation clips (BicepCurl, Burpee, Jogging, Situp, Plank), lazy within the lazy

---

## Persistence (localStorage)

All keys prefixed `yr_`:

| Key | Contents |
|---|---|
| `yr_profile` | Full user profile object |
| `yr_done_<weekKey>` | `{ "dayIndex-exId": true }` — auto-resets each week |
| `yr_swaps_<weekKey>` | `{ "dayIndex-exId": swapExerciseObject }` |
| `yr_log_<weekKey>_<day>_<exId>` | `[{ set, reps, weight, rpe, done }]` per exercise |
| `yr_readiness_<date>` | `{ energy, sleep, soreness }` |
| `yr_gut_<date>` | Gut check-in fields |
| `yr_gut_<date>_triggers` | Array of selected triggers |
| `yr_gut_<date>_note` | Free-text trigger note |
| `yr_hf_vid_<exId>` | Cached Higgsfield video URL |

Week key format: `YYYY-W<nn>` (resets done/swaps each week).

---

## Readiness system

Daily check-in (energy 1–5, sleep Poor/Ok/Good, soreness None/Mild/High) shown at top of Plan tab. After saving:
- Shows compact summary row with phase guidance
- Feeds into `cycleEngine.adaptVolume()` for intensity suggestions
- Persists to `yr_readiness_<date>`

---

## Progressive overload

WorkoutLogger reads `yr_log_<prevWeekKey>_<day>_<exId>`. If all sets were done at RPE ≤ 7:
- Shows "Last week: 12 × 15 @7" reference bar
- Shows "↑ Try more load today" green nudge
- Previous weight/reps shown as input placeholders

---

## Settings page

Sections:
1. Profile — name, goal chips
2. Available equipment — multi-select chips
3. Preferences — units, health sync toggle
4. Data & Privacy:
   - Export my data (downloads JSON of all `yr_*` keys)
   - **Clear demo videos** (removes `yr_hf_vid_*` keys, shows count)
   - Clear all data (with confirm step)
   - Medical disclaimer

---

## What's been deliberately excluded / deferred

| Feature | Status |
|---|---|
| Backend / user accounts | Not built — all localStorage |
| Real Apple HealthKit / Google Fit | Simulated mock data |
| Pain-aware swaps | Architecture ready, not built |
| free-exercise-db integration | Research complete, integration pending |
| GLB branded character | FBX POC done, final model asset needed |
| Pricing / subscription | Placeholder page only |
| Symptom log / phase pattern trends | Not built |
| Android / PWA | Not configured |

---

## Higgsfield API

**Image-to-video only** (not text-to-video). Uses `POST /higgsfield-ai/dop/preview`.

- Proxied at `/higgsfield` → `platform.higgsfield.ai` (Vite proxy)
- Auth: `Authorization: Key YOUR_KEY_ID:YOUR_KEY_SECRET`
- Body: `{ prompt, image_url, duration: 5 }`
- Category-specific seed images (strength, cardio, yoga, fat burn)
- Poll: `GET /requests/{id}/status`
- Cached in `yr_hf_vid_<exId>` — no regeneration on reopen

---

## Build output

```
Main bundle:      318KB (gzip ~95KB)
Three.js chunk:   880KB (gzip ~234KB) — lazy, only on ▷ 3D tap
FBXMannequin:      51KB (gzip ~17KB)  — lazy, only inside 3D path
CSS:               11KB (gzip ~3KB)
```

---

## Key design decisions made

1. **2D SVG animation as default** — ExerciseAnimation renders instantly. 3D is opt-in to avoid 880KB load on mobile.
2. **Phase accent on CSS root** — `document.documentElement.style.setProperty("--phase-accent", color)` lets all components use `var(--phase-accent)` without prop drilling.
3. **Week-scoped done/swap state** — resets automatically each Monday. No stale data.
4. **`_doneKey` on modal object** — ensures done-tracking always maps to the original exercise slot, not the swap exercise's ID.
5. **Band-first swaps** — `hasBands && SWAP_LIBRARY_BANDS[exId] || SWAP_LIBRARY[exId]` prefers resistance band alternatives when available.
6. **Science-honest cycle copy** — no "Push it" language. McMaster 2025 caveat on follicular claims. ACL mechanism explained. Luteal late BMR physiology explained.
7. **Cycle length is user-adjustable** — `getPhaseWindows(cycleLength)` recalculates all phase windows dynamically. Input lives in Cycle tab.

---

## What a designer needs to know

- **Max width: 430px** — this is a mobile-first app, not a web dashboard
- **Warm dark palette** — background `#0f0c12`, not pure black
- **Phase accent is dynamic** — rose/sage/amber/violet/blue depending on phase. All phase-colored UI elements reference `var(--phase-accent)`
- **Exercise cards are flat rows** — not grid tiles. Index number + text + badges + chevron
- **No neon** — muted sage/rose/violet, not hot pink or electric green
- **No emoji in nav** — abstract unicode symbols (◈ ↗ ◎ ✦ ○ ≡)
- **Cards are barely-visible** — `rgba(255, 248, 244, 0.06)` warm tint on dark bg
- **Today card is the hero** — 2-column layout, large workout name, phase copy, Start CTA
- **Readiness-aware copy** — all coaching language is hedged ("if readiness feels good", "research suggests")

---

## Commit history (recent)

```
3b0b4b8  Add cycle length input to Cycle tab; fix rapid-tap accumulation
c44e964  Research-grounded Cycle tab rewrite + variable cycle length engine
683a0a8  Restore 2D as default exercise visual; make 3D opt-in
d38df9d  Add real Mixamo FBX character with 5 exercise animation clips (POC)
7e9f6a8  Add gender-aware 3D mannequin: female/male forms with multi-material outfit
c6a3f16  Add band-first swap priority when user has resistance bands
88b1647  Expand SWAP_LIBRARY with bodyweight alternatives for dumbbell exercises
ddfaf22  Fix swap done-tracking key to always use original exercise slot
4227480  Add actionable exercise swaps for missing-equipment warnings
aee9e7c  Improve 3D mannequin: joint spheres, better proportions, lerped animation
85c8a48  Lazy-load Three.js and add camera presets per animation
bb8b5c9  Replace SVG stick figure with 3D clay mannequin (React Three Fiber)
0616db6  Add Gut Reset page with daily check-in, score, and safety card
```
