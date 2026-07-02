# YourReset

A cycle-aware fitness and wellness app that adapts workouts, nutrition, and readiness guidance to the user's hormonal cycle phase — with goal-based adaptive plans for male and non-cycle users too.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build | Vite 8 |
| Styling | Vanilla CSS design system (`src/index.css`) + inline styles |
| 3D | React Three Fiber, Three.js, `@react-three/drei` |
| Mobile | Capacitor (iOS + Android) |
| Storage | localStorage only (no backend) |
| Health data | HealthKit via `@capgo/capacitor-health` |

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
npm run lint       # run ESLint
```

## Mobile (Capacitor)

The app ships as a native iOS/Android shell around the built web app.

```bash
npm run build
npx cap sync       # copy dist/ into ios/ and android/ projects
npx cap open ios       # open in Xcode
npx cap open android   # open in Android Studio
```

## Project structure

```
src/
  App.jsx                — app shell: state, routing, nav
  Onboarding.jsx          — onboarding wizard (goal, gender/cycle, equipment)
  main.jsx                — React root
  index.css               — design system (CSS tokens, component classes)
  storage.js               — localStorage helpers
  cycleEngine.js            — cycle phase calculation and phase content
  workoutData.js            — workout plans, equipment mapping, exercise swaps
  nutritionEngine.js        — nutrition phases and goal-based nudges
  gutEngine.js               — gut check-in scoring and triggers
  healthService.js          — HealthKit integration
  notificationService.js    — local notifications
  components/               — tab screens and UI components

docs/                       — setup guides (HealthKit, notifications)
ios/, android/               — native Capacitor projects
```

See [docs/healthkit-setup.md](docs/healthkit-setup.md) and [docs/notifications-setup.md](docs/notifications-setup.md) for platform-specific setup.
