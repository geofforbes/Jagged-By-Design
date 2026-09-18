const PALETTE = ["#C4714E", "#4A7B6A", "#6B7FD7", "#B07BA6", "#E0885C", "#5B8A72"];

/** Deterministic color per contributor name, stable across screens. */
export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
