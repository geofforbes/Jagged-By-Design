/**
 * Project-wide default Claude model. Sonnet 5 rather than Opus 5 (Anthropic's
 * usual default) - deliberate cost choice for this project, not a capability
 * gap: extraction/classification/vision here are well-defined structured
 * tasks Sonnet handles reliably at under half Opus's price. Change here only
 * if explicitly asked to switch back.
 */
export const CLAUDE_MODEL = "claude-sonnet-5";
