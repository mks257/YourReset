# Local notifications — post-merge setup

`@capacitor/local-notifications` is the first-party Capacitor plugin
that wraps `UNUserNotificationCenter` on iOS. It does **not** require
push notification certificates, server infrastructure, or
`NSUserNotificationUsageDescription` in Info.plist. The system
permission prompt fires the first time the user enables a toggle in
Settings → Notifications.

## What's already wired (this branch)

| File | Purpose |
|---|---|
| `src/notificationService.js` | Wrapper: permission, daily reminder, cycle phase alerts, cancel |
| `src/storage.js` | `getNotificationPrefs` / `setNotificationPrefs` |
| `src/components/SettingsPage.jsx` | Notifications section with toggles + time picker |
| `src/App.jsx` | Schedules on mount; reschedules when prefs or cycle data change |

## After this branch merges, on your Mac

If the iOS platform isn't added yet (see `docs/healthkit-setup.md`):

```bash
brew install cocoapods           # one-time
npx cap add ios                  # one-time
npx cap sync ios
```

If iOS is already added:

```bash
npm run build
npx cap sync ios
```

Then in Xcode:

1. No capability needs to be added for `LocalNotifications` — unlike HealthKit.
2. Optional: under **Signing & Capabilities → + Capability**, add **Background Modes** if you later want to deliver notifications while the app is closed (not required for the current schedule which fires on calendar triggers).
3. Build and run on a physical iPhone (the simulator is fine for permission flow but local notifications are reliable on device).

## On-device test path

1. Open the app, complete onboarding.
2. Go to **Settings → Notifications → Daily workout reminder**.
3. iOS shows the system permission sheet — tap **Allow**.
4. Pick a time 1–2 minutes in the future.
5. Lock the device. The notification should appear at the chosen time.
6. Re-open Settings, toggle off. The reminder is cancelled.
7. If `Cycle tracking` is on in your profile, the **Cycle phase alerts**
   toggle appears. Enabling it schedules up to ~5 weeks of one-shot
   alerts at 9am local on each phase boundary, recomputed any time
   you change `cycleStartDate` or `cycleLength`.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Toggle won't stay on | User denied permission. Reset in iOS Settings → YourReset → Notifications, or in YourReset's own Settings (toggle re-prompts on first enable). |
| Notification doesn't fire at the chosen time | iOS may delay if device is in Low Power Mode or Focus Mode. Verify in iOS Settings → Notifications → YourReset that Allow Notifications is on. |
| Phase alerts not appearing | Make sure `profile.cycleStartDate` is set (Onboarding cycle step). Without it, `scheduleCyclePhaseAlerts` no-ops. |
| Stale notifications after changing cycle length | The scheduler cancels all phase-alert IDs (range 2000–2099) before rescheduling, so this shouldn't happen — but if it does, toggle the alert off and back on to force a full reschedule. |

## App Store notes

- No special review requirements for `LocalNotifications`. Apple treats it
  as standard local-only content.
- The Settings UI clearly states "Local reminders scheduled on your
  device. Nothing pushed from a server." — this matches our actual
  behaviour and avoids App Privacy Label confusion.
- Add a brief mention to `legal/privacy.md` when convenient: "YourReset
  uses local notifications scheduled on your device. No notification
  data is sent to any server."

## Cancellation safety

`Storage.clearAll()` (Settings → Delete account) wipes notification prefs
along with everything else. App.jsx's `onClearAll` handler now explicitly
calls `Notifications.cancelDailyWorkoutReminder()` and
`Notifications.cancelCyclePhaseAlerts()` so the OS-level scheduled
notifications are removed too. Without that, deleted-account users
would still receive their old reminders.
