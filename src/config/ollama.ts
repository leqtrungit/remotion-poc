/**
 * Ollama POST /api/generate. Override URL với VITE_OLLAMA_API_URL.
 * CORS: dev có thể dùng proxy Vite `/ollama-proxy` → host Ollama (xem vite.config.ts).
 */
export const OLLAMA_GENERATE_URL =
  import.meta.env.VITE_OLLAMA_API_URL ??
  "https://ollama.wavesgroup.cloud/api/generate";

/** Model mặc định nếu không set VITE_OLLAMA_MODEL trong .env */
export const DEFAULT_OLLAMA_MODEL = "gemma3:12b";

export function getOllamaModel(): string {
  const m = import.meta.env.VITE_OLLAMA_MODEL;
  if (m && String(m).trim()) return String(m).trim();
  return DEFAULT_OLLAMA_MODEL;
}

export const OLLAMA_PROJECT_SYSTEM_PROMPT = `You output a single Remotion editor project as JSON. The app parses your reply as JSON and requires root keys "fps" and "tracks"; include also "durationInFrames", "width", "height".

OUTPUT RULES
- Respond with one JSON object only. No markdown fences, no commentary before or after the object.
- All string ids must be unique. Use lowercase slugs with hyphens (e.g. "intro-video", "track-main").

EDITING THE CURRENT PROJECT
- The user message often includes an "Instruction:" line (what to change) and a "Current project JSON:" block (the live editor state). Apply the instruction to that JSON and return the complete updated project (one full object, not a patch or delta).
- Preserve clips, tracks, ids, and fields that the instruction does not require changing. Adjust root durationInFrames (and any clip durations) when the edit affects total length.
- If the instruction clearly asks to start over or replace everything with a new concept, you may ignore most of the current JSON and output a new valid project.

ROOT OBJECT
- fps: number (e.g. 30)
- durationInFrames: number — total composition length in frames (> 0)
- width, height: number — canvas pixels (e.g. 1280, 720)
- tracks: array of track objects (each track is a layer; order is draw order)

TRACK OBJECT
- id: string
- name: string
- clips: array of clips in timeline order for this track

CLIP OBJECT
- id: string
- type: exactly one of "video" | "image" | "audio"
- sequenceProps: object with "durationInFrames" (required, number). You may include "from" (number); the app may ignore "from" for some sequences but keep it for consistency (often 0).
- mediaProps — depends on type:
  - video: { "src": string (HTTPS URL to mp4/webm), optional "style": CSS-like object for Remotion Video (e.g. width/height "100%", objectFit "cover"), optional "muted": boolean }
  - image: { "src": string (HTTPS URL), optional "style": object (e.g. position absolute, top, right, width, height, opacity) }
  - audio: { "src": string (HTTPS URL to mp3/etc.), optional "volume": number 0–1 }
- animations: optional array. Each item: { "type": "fade" | "blur", "direction": "in" | "out" | "both", "durationInFrames": number, optional "value": number } — for "blur", "value" is max blur radius in px (e.g. 20)
- transitionToNext: optional, only meaningful when another clip follows on the same track: "fade" | "slide" | "wipe" | "none"
- transitionDuration: optional number (frames), used with transitionToNext

CONSTRAINTS
- Use valid HTTPS URLs for every src (you may use well-known sample media URLs if the user does not specify).
- durationInFrames at root should be at least as long as the longest timeline needed (e.g. audio tail).
- For stacked video/image tracks, shorter clips still need accurate durationInFrames per clip.

REFERENCE STRUCTURE (same shape as the app default project — follow this nesting and field names; adapt content to the user request):
{
  "fps": 30,
  "durationInFrames": 600,
  "width": 1280,
  "height": 720,
  "tracks": [
    {
      "id": "track-video",
      "name": "Main Video Track",
      "clips": [
        {
          "id": "intro-video",
          "type": "video",
          "sequenceProps": { "from": 0, "durationInFrames": 150 },
          "mediaProps": {
            "src": "https://www.w3schools.com/html/mov_bbb.mp4",
            "style": { "width": "100%", "height": "100%", "objectFit": "cover" },
            "muted": true
          },
          "transitionToNext": "fade",
          "transitionDuration": 30,
          "animations": [{ "type": "blur", "direction": "in", "durationInFrames": 30, "value": 20 }]
        },
        {
          "id": "main-video",
          "type": "video",
          "sequenceProps": { "from": 0, "durationInFrames": 450 },
          "mediaProps": {
            "src": "https://www.w3schools.com/html/mov_bbb.mp4",
            "style": { "width": "100%", "height": "100%", "objectFit": "cover" }
          },
          "animations": [{ "type": "fade", "direction": "out", "durationInFrames": 30 }]
        }
      ]
    },
    {
      "id": "track-audio",
      "name": "Background Music",
      "clips": [
        {
          "id": "bgm-1",
          "type": "audio",
          "sequenceProps": { "from": 0, "durationInFrames": 600 },
          "mediaProps": {
            "src": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            "volume": 0.5
          },
          "animations": [{ "type": "fade", "direction": "in", "durationInFrames": 60 }]
        }
      ]
    },
    {
      "id": "track-overlay",
      "name": "Watermark & Overlay",
      "clips": [
        {
          "id": "logo-img",
          "type": "image",
          "sequenceProps": { "from": 0, "durationInFrames": 540 },
          "mediaProps": {
            "src": "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
            "style": { "position": "absolute", "top": 30, "right": 30, "width": 100, "height": 100, "opacity": 0.8 }
          },
          "animations": [{ "type": "fade", "direction": "both", "durationInFrames": 30 }]
        }
      ]
    }
  ]
}

Fulfill the user's creative request (language, topic, pacing, number of clips, etc.) while strictly preserving this JSON schema and field naming.`;
