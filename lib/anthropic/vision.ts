import type { SkinType } from '@/types/zadoc';

// Real Claude Vision call — replaces Piece 4's mock /api/analyze classifier.
// Uses tool-use to force structured JSON output, then validates the result
// against the app's actual skin_type enum before trusting it at all. Never
// trusts the model blindly: invalid/malformed output is retried once, and a
// second failure surfaces as a clean "face not detected / try again" result
// rather than silently persisting garbage.

const SKIN_TYPES: SkinType[] = ['dry', 'oily', 'combination', 'normal', 'sensitive'];
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export interface VisionAnalysisResult {
  face_detected: boolean;
  skin_type: SkinType | null;
  skin_score: number | null; // 0-100
  insights: string[]; // 2-4 short, specific observations
}

interface ParsedDataUrl {
  mediaType: string;
  base64: string;
}

function parseDataUrl(dataUrl: string): ParsedDataUrl {
  const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error('Invalid image data URL');
  return { mediaType: match[1], base64: match[2] };
}

const ANALYSIS_TOOL = {
  name: 'record_skin_analysis',
  description:
    'Records the structured result of a facial skin analysis from a single photo.',
  input_schema: {
    type: 'object',
    properties: {
      face_detected: {
        type: 'boolean',
        description: 'Whether a clear, usable human face is visible in the photo.',
      },
      skin_type: {
        type: ['string', 'null'],
        enum: [...SKIN_TYPES, null],
        description: 'Best-fit skin type classification, or null if face_detected is false.',
      },
      skin_score: {
        type: ['number', 'null'],
        description: 'Overall skin health score from 0-100, or null if face_detected is false.',
      },
      insights: {
        type: 'array',
        items: { type: 'string' },
        description: '2-4 short, specific, non-diagnostic observations about the visible skin.',
      },
    },
    required: ['face_detected', 'skin_type', 'skin_score', 'insights'],
  },
};

function isValidResult(raw: unknown): raw is VisionAnalysisResult {
  if (!raw || typeof raw !== 'object') return false;
  const r = raw as Record<string, unknown>;
  if (typeof r.face_detected !== 'boolean') return false;

  if (!r.face_detected) return true; // skin_type/score may legitimately be null

  if (typeof r.skin_type !== 'string' || !SKIN_TYPES.includes(r.skin_type as SkinType)) return false;
  if (typeof r.skin_score !== 'number' || r.skin_score < 0 || r.skin_score > 100) return false;
  if (!Array.isArray(r.insights) || r.insights.length === 0) return false;
  if (!r.insights.every((i) => typeof i === 'string')) return false;
  return true;
}

async function callClaudeOnce(imageDataUrl: string): Promise<unknown> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const { mediaType, base64 } = parseDataUrl(imageDataUrl);

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      tools: [ANALYSIS_TOOL],
      tool_choice: { type: 'tool', name: 'record_skin_analysis' },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text:
                'Analyze this facial photo for a skincare app. Determine whether a clear human ' +
                'face is visible, and if so classify the visible skin type as exactly one of: ' +
                'dry, oily, combination, normal, sensitive. Give an overall skin health score ' +
                'from 0-100 and 2-4 short, specific, non-diagnostic observations (texture, ' +
                'shine, visible dryness/redness, pore size, etc). This is cosmetic guidance, ' +
                'not a medical diagnosis. Call record_skin_analysis with your structured result.',
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Anthropic API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const toolUse = (data.content ?? []).find((b: { type: string }) => b.type === 'tool_use');
  if (!toolUse) throw new Error('No tool_use block in Claude response');
  return toolUse.input;
}

/** Calls Claude Vision, validates the structured output, and retries once on invalid output. */
export async function analyzeSkinPhoto(imageDataUrl: string): Promise<VisionAnalysisResult> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const raw = await callClaudeOnce(imageDataUrl);
      if (isValidResult(raw)) return raw;
      // eslint-disable-next-line no-console
      console.warn('[zadoc] Claude vision returned invalid structured output, retrying', raw);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[zadoc] Claude vision call failed', err);
      if (attempt === 1) throw err;
    }
  }
  // Both attempts produced invalid/untrustworthy output — treat as "no face
  // detected" rather than ever persisting an unvalidated skin_type/score.
  return { face_detected: false, skin_type: null, skin_score: null, insights: [] };
}
