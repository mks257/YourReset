/**
 * notificationService — thin wrapper around @capacitor/local-notifications.
 *
 * Handles:
 *   - permission lifecycle (check + request)
 *   - daily workout reminder (single repeating notification at user-chosen time)
 *   - cycle phase change alerts (one-shot notifications for the next N phase
 *     transitions, recomputed when cycle data changes)
 *   - clean cancel/reschedule across all scheduled notifications
 *
 * iOS notes:
 *   LocalNotifications doesn't need a usage-description string in Info.plist.
 *   It does need the user to grant notification permission (system prompt).
 *
 * Web behaviour:
 *   isAvailable() returns false; every scheduling call no-ops and resolves
 *   so the React layer can pretend nothing happened. The Settings toggle
 *   still flips and persists so the same code path works after install.
 */
import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";
import { PHASES, PHASE_EMOJI, getPhaseWindows } from "./cycleEngine";

// Stable notification IDs — used to update or cancel cleanly. Phase-alert
// IDs are reserved in a contiguous range so we can cancel them all without
// touching the workout reminder.
const WORKOUT_REMINDER_ID = 1001;
const PHASE_ALERT_ID_BASE = 2000; // ids 2000..2099 reserved for phase alerts

/**
 * True if the LocalNotifications plugin is installed and we're on iOS/Android.
 * On web (Vite dev), Capacitor.isNativePlatform() is false.
 */
export function isAvailable() {
  return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("LocalNotifications");
}

/**
 * Check current OS permission state. Returns one of:
 *   "granted" | "denied" | "prompt" | "prompt-with-rationale" | "unavailable"
 */
export async function checkPermission() {
  if (!isAvailable()) return "unavailable";
  try {
    const { display } = await LocalNotifications.checkPermissions();
    return display || "prompt";
  } catch (err) {
    console.warn("[notifications] checkPermission failed:", err);
    return "denied";
  }
}

/**
 * Trigger the system permission prompt if not already decided. Returns true
 * only if the user grants permission (or it was already granted).
 */
export async function requestPermission() {
  if (!isAvailable()) return false;
  try {
    const { display } = await LocalNotifications.requestPermissions();
    return display === "granted";
  } catch (err) {
    console.error("[notifications] requestPermission failed:", err);
    return false;
  }
}

/**
 * Cancel a specific notification ID. Safe to call when nothing is pending.
 */
async function cancelIds(ids) {
  if (!isAvailable() || !ids.length) return;
  try {
    await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
  } catch (err) {
    console.warn("[notifications] cancel failed:", err);
  }
}

/**
 * Cancel everything in the phase-alert ID range (2000..2099).
 * Called before rescheduling so we don't pile up stale alerts when
 * the user changes cycle length / start date.
 */
async function cancelAllPhaseAlerts() {
  const ids = [];
  for (let i = 0; i < 100; i++) ids.push(PHASE_ALERT_ID_BASE + i);
  await cancelIds(ids);
}

/**
 * Schedule a daily workout reminder at the given HH:mm in local time.
 * Replaces any existing daily reminder.
 *
 * @param {string} time  "HH:mm" (24h, local time). e.g. "08:00"
 * @param {string} userName  for the notification body
 */
export async function scheduleDailyWorkoutReminder(time, userName = "You") {
  if (!isAvailable()) return false;

  // Always cancel the old reminder before scheduling the new one so the
  // time change actually takes effect.
  await cancelIds([WORKOUT_REMINDER_ID]);

  const [hh, mm] = (time || "08:00").split(":").map(n => parseInt(n, 10));
  if (Number.isNaN(hh) || Number.isNaN(mm)) {
    console.warn("[notifications] invalid time:", time);
    return false;
  }

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: WORKOUT_REMINDER_ID,
          title: "Time to move",
          body: `${userName}, your workout is ready in YourReset.`,
          // iOS: schedule.on triggers daily at the given hour/minute
          schedule: {
            on: { hour: hh, minute: mm },
            allowWhileIdle: true,
          },
          // Sound, smallIcon etc. left to defaults; can be themed later.
        },
      ],
    });
    return true;
  } catch (err) {
    console.error("[notifications] scheduleDailyWorkoutReminder failed:", err);
    return false;
  }
}

export async function cancelDailyWorkoutReminder() {
  await cancelIds([WORKOUT_REMINDER_ID]);
}

/**
 * Schedule one-shot phase change alerts for the next N cycle days.
 * Looks ahead 35 days from now and fires at 9am local on each phase
 * transition boundary.
 *
 * Re-call this whenever cycleStartDate or cycleLength changes so the
 * schedule reflects current truth.
 *
 * @param {string|Date} cycleStartDate  user's last period start
 * @param {number} cycleLength
 */
export async function scheduleCyclePhaseAlerts(cycleStartDate, cycleLength = 28) {
  if (!isAvailable()) return false;
  if (!cycleStartDate) return false;

  // Wipe any prior phase alerts first
  await cancelAllPhaseAlerts();

  const start = new Date(cycleStartDate);
  start.setHours(0, 0, 0, 0);
  if (Number.isNaN(start.getTime())) return false;

  const windows = getPhaseWindows(cycleLength); // { phaseKey: [startDay, endDay] }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build a list of upcoming phase-start dates over the next 35 days.
  // Iterate through cycles; for each cycle, each phase has a startDay
  // offset within the cycle. We schedule the alert on the day that
  // boundary lands in calendar time.
  const upcoming = [];
  for (let cycleIdx = 0; cycleIdx < 3; cycleIdx++) {
    for (const [phase, [startDay]] of Object.entries(windows)) {
      const dayOffset = cycleIdx * cycleLength + (startDay - 1);
      const date = new Date(start);
      date.setDate(start.getDate() + dayOffset);
      date.setHours(9, 0, 0, 0); // 9am local time
      if (date <= today) continue;
      // Don't schedule more than ~5 weeks out — iOS caps pending and
      // user might change cycle data anyway
      const daysAhead = (date - today) / 86400000;
      if (daysAhead > 35) continue;
      upcoming.push({ phase, date });
    }
  }

  if (!upcoming.length) return true;

  try {
    await LocalNotifications.schedule({
      notifications: upcoming.slice(0, 100).map((u, idx) => {
        const phaseMeta = PHASES[u.phase];
        const emoji = PHASE_EMOJI[u.phase] || "✨";
        return {
          id: PHASE_ALERT_ID_BASE + idx,
          title: `${emoji} ${phaseMeta?.label || u.phase} phase starting`,
          body: phaseMeta?.tip?.split(/[.!?]/)[0] + "." || "Your workouts adapt today.",
          schedule: { at: u.date, allowWhileIdle: true },
        };
      }),
    });
    return true;
  } catch (err) {
    console.error("[notifications] scheduleCyclePhaseAlerts failed:", err);
    return false;
  }
}

export async function cancelCyclePhaseAlerts() {
  await cancelAllPhaseAlerts();
}

/**
 * Inspect what's currently scheduled. Useful for debugging from Settings.
 * Returns an array of pending notifications or an empty array on web.
 */
export async function listPending() {
  if (!isAvailable()) return [];
  try {
    const { notifications } = await LocalNotifications.getPending();
    return notifications || [];
  } catch (err) {
    console.warn("[notifications] listPending failed:", err);
    return [];
  }
}
