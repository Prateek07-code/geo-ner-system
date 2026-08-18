// Single source of truth for talking to the GeoNER backend.
// Swapping to a deployed backend later = change VITE_API_BASE_URL in .env, nothing else.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 15000;

export class AnalyzeError extends Error {
  constructor(message, { cause } = {}) {
    super(message);
    this.name = "AnalyzeError";
    if (cause) this.cause = cause;
  }
}

/**
 * Calls POST {API_BASE_URL}/analyze with { sentence }.
 * Matches the locked contract exactly:
 *   request:  { sentence: string }
 *   response: { sentence, entities: [{ text, start, end, resolved, alternates }] }
 *
 * Throws AnalyzeError with a friendly, UI-ready message on any failure
 * (network down, timeout, non-2xx, or unparsable body).
 */
export async function analyzeSentence(sentence) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new AnalyzeError(
        "The analysis is taking longer than expected. Please try again.",
        { cause: err }
      );
    }
    throw new AnalyzeError(
      "Couldn't reach the GeoNER API. Check that the backend is running and reachable.",
      { cause: err }
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new AnalyzeError(
      `The API returned an error (status ${response.status}). Please try again.`
    );
  }

  try {
    return await response.json();
  } catch (err) {
    throw new AnalyzeError(
      "The API sent back a response we couldn't read. Please try again.",
      { cause: err }
    );
  }
}
