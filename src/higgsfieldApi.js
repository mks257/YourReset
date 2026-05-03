/**
 * Higgsfield image-to-video demo generation
 * platform.higgsfield.ai — official public API
 *
 * This is NOT text-to-video. All models require an input image.
 * The model applies cinematic motion to that frame, guided by the prompt.
 *
 * Model: higgsfield-ai/dop/preview
 *   DoP (Director of Photography) — cinematic motion, ~5s, 720p
 *   Good fit for exercise motion demos.
 *
 * Auth:    Authorization: Key YOUR_KEY_ID:YOUR_KEY_SECRET
 * Create:  POST /{model_id}  → { request_id }
 * Poll:    GET  /requests/{request_id}/status → { status, output }
 *
 * Docs: https://docs.higgsfield.ai
 *
 * Product role: "wow" moments and social/share clips only.
 * Core workout instruction should use 3D avatar (Rive/Three.js/VRoid).
 */

const BASE = '/higgsfield';

// ── Category-specific seed images ─────────────────────────────────────────
// Passing a contextually matched start frame improves motion relevance.
// All images are from Unsplash (free to use).
const SEED_IMAGES = {
  Strength:    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=720&q=78&fit=crop', // barbell rack
  Toning:      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=720&q=78&fit=crop', // dumbbell curl
  'Fat Burn':  'https://images.unsplash.com/photo-1434596922112-19c563067271?w=720&q=78&fit=crop', // treadmill run
  Cardio:      'https://images.unsplash.com/photo-1434596922112-19c563067271?w=720&q=78&fit=crop', // treadmill run
  Flexibility: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=720&q=78&fit=crop', // yoga stretch
  Recovery:    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=720&q=78&fit=crop', // yoga/rest
  _default:    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=720&q=78&fit=crop', // neutral gym
};

function seedImage(exerciseType) {
  return SEED_IMAGES[exerciseType] ?? SEED_IMAGES._default;
}

function headers() {
  return {
    Authorization: `Key ${import.meta.env.VITE_HIGGSFIELD_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

/**
 * Start an image-to-video generation for an exercise demo.
 * @param {string} exerciseName - e.g. "Dumbbell Chest Press"
 * @param {string} exerciseType - e.g. "Strength" — used to pick seed image
 * @returns {Promise<{ request_id: string }>}
 */
export async function createVideoGeneration(exerciseName, exerciseType = '') {
  const prompt =
    `Person performing ${exerciseName} in a gym, ` +
    `smooth controlled motion, professional fitness demonstration, cinematic lighting`;

  const res = await fetch(`${BASE}/higgsfield-ai/dop/preview`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      prompt,
      image_url: seedImage(exerciseType),
      duration: 5,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Higgsfield ${res.status}: ${body || 'request failed'}`);
  }

  return res.json();
}

/**
 * Poll generation status.
 * @param {string} id - request_id from createVideoGeneration response
 */
export async function pollGeneration(id) {
  const res = await fetch(`${BASE}/requests/${id}/status`, { headers: headers() });
  if (!res.ok) throw new Error(`Poll ${res.status}`);
  return res.json();
}

/**
 * Extract the video URL from any shape of DoP poll response.
 */
export function extractVideoUrl(pollData) {
  return (
    pollData?.output?.url       ??
    pollData?.output?.video_url ??
    pollData?.results?.raw?.url ??
    pollData?.results?.url      ??
    pollData?.video_url         ??
    pollData?.url               ??
    null
  );
}
