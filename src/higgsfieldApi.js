const BASE = '/higgsfield';

function headers() {
  return {
    'Authorization': `Key ${import.meta.env.VITE_HIGGSFIELD_KEY}`,
    'Content-Type': 'application/json',
  };
}

export async function createVideoGeneration(exerciseName) {
  const prompt =
    `A fit woman performing ${exerciseName} exercise in a modern gym, ` +
    `cinematic slow motion, perfect form demonstration, professional fitness video, ` +
    `4K quality, motivational lighting`;

  const res = await fetch(`${BASE}/v1/generations`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model: 'wan2-5-video',
      input: {
        prompt,
        duration: 5,
        aspect_ratio: '9:16',
        resolution: '720p',
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Higgsfield ${res.status}: ${err}`);
  }
  return res.json();
}

export async function pollGeneration(id) {
  const res = await fetch(`${BASE}/v1/generations/${id}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Poll ${res.status}`);
  return res.json();
}
