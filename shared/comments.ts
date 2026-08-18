// Shared comment constants used by both the API (server) and the editor (client)
// so the length limit can never drift between validation and UI.
export const COMMENT_MAX_LENGTH = 500
export const COMMENT_RATE_LIMIT = 5
export const COMMENT_RATE_WINDOW_MS = 60_000
