// Shared moment constants used by both the API (server) and the client UI
// so rate limits and limits can never drift between validation and UI.
export const LIKE_RATE_LIMIT = 20
export const LIKE_RATE_WINDOW_MS = 60_000
export const MOMENT_TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/'
