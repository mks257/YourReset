# HealthKit setup — post-merge actions on your dev machine

Most of the HealthKit wiring is already in source (`feat/healthkit` branch).
A few steps require Xcode + CocoaPods + a physical iPhone and therefore
must run on your Mac.

## One-time prerequisites

```bash
# Install CocoaPods (required by Capacitor iOS plugins)
brew install cocoapods            # if you have Homebrew
# OR, without Homebrew:
sudo gem install cocoapods

# Verify Xcode command-line tools
xcode-select -p                   # should print /Applications/Xcode.app/...

# Verify Capacitor has the iOS platform
npx cap doctor
```

If `ios/` doesn't exist yet:

```bash
npx cap add ios
npx cap sync ios
```

If `ios/` already exists (it does on this branch), just sync after every
JS build:

```bash
npm run build
npx cap sync ios
```

## What's already in the repo

| File | What it does |
|---|---|
| `ios/App/App/App.entitlements` | Enables HealthKit + background-delivery entitlements |
| `ios/App/App/Info.plist` | `NSHealthShareUsageDescription` + `NSHealthUpdateUsageDescription` strings |
| `src/healthService.js` | Wrapper around `@capgo/capacitor-health` |
| `src/hooks/useLiveHealth.js` | React hook consumed by `App.jsx` |
| Settings → Apple Health Sync toggle | User-facing opt-in |

## Xcode signing steps (only required once per Apple Developer account)

After `npx cap add ios`, open the workspace:

```bash
open ios/App/App.xcworkspace
```

In Xcode:

1. Select the **App** target → **Signing & Capabilities** tab.
2. Make sure your **Team** is selected (the Apple Developer Program account).
3. Confirm **HealthKit** is listed under Capabilities. If it isn't:
   - Click **+ Capability**, search **HealthKit**, double-click to add.
   - Tick **Background Delivery** if not already on.
4. Bundle identifier should match `com.yourreset.app` (set during `cap init`).

The `App.entitlements` file we committed will be referenced automatically;
Xcode does not duplicate it.

## Running on device

1. Plug in an iPhone, trust the Mac when prompted.
2. In Xcode, select your iPhone as the run destination (top-left next to the
   App scheme name).
3. Press the Play button (⌘R).
4. On first launch, tap **Settings → Apple Health Sync → toggle on**.
5. iOS will present the HealthKit permission sheet. Grant **all** read
   permissions (steps, calories, heart rate, resting heart rate, weight).
6. Return to the **Progress** tab to verify your real metrics appear.

Note: HealthKit's `restingHeartRate` and `heartRate` types may be empty in
the simulator — test these on a real iPhone or a paired Apple Watch.

## Web behaviour

In Vite dev mode (browser), `HealthService.isPluginAvailable()` returns
`false` and the Settings toggle status shows **"Web Simulator"**. The
toggle is still persisted via Capacitor Preferences but no real fetches
happen — `liveData` stays `null`, and `MetricsTab` renders empty states
("Connect to begin.").

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build error: `'HealthKit/HealthKit.h' file not found` | Re-run `npx cap sync ios`. Confirm HealthKit capability is added in Xcode. |
| Permission sheet doesn't appear | Make sure Info.plist contains both `NSHealthShare…` and `NSHealthUpdate…` keys. Force-quit the app in iOS, reset privacy in iOS Settings → General → Transfer or Reset iPhone → Reset → Reset Location & Privacy (warning: nuclear), then reinstall. |
| Resting HR always `null` | Resting HR requires an Apple Watch or compatible device. iPhone alone doesn't collect it. |
| Step counts off by `0.5x` or `2x` | Some HealthKit data sources double-count steps. Check the iOS Health app to see source priorities (Settings → Health → Data Sources & Access). |
| `Health.queryAggregated` errors with `not authorized` | The user revoked permission in iOS Settings → Health → Data Access & Devices → YourReset. Have them re-grant. |

## App Store submission notes

Apple's HealthKit review checklist requires:

- **Clear in-app rationale before the permission prompt.** YourReset shows
  this in the Settings toggle helper text. If you want extra safety, add a
  full-screen onboarding step the first time the user taps the toggle.
- **No write access requested.** Confirmed in `healthService.js` —
  `Health.requestAuthorization({ ..., write: [] })`.
- **No HealthKit data leaves the device for advertising or marketing.**
  Confirmed — we don't have any server.
- **Privacy Policy must explicitly mention HealthKit data handling.**
  Already in `legal/privacy.md`.
- **App Privacy Labels** in App Store Connect must list "Health & Fitness"
  → "Linked to You: No" (since we don't tie health data to identity).
