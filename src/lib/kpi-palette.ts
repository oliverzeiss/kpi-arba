/**
 * 10-Color Official Glassmorphic Gradient Palette:
 * High contrast interleaved spectrum tailored for Dark Cyan / Emerald / Glass theme.
 */
export const RAW_KPI_PALETTE = [
  '#00e5ff', // Vivid Cyan
  '#10b981', // Bright Emerald
  '#38bdf8', // Sky Blue
  '#fbbf24', // Amber Gold
  '#a855f7', // Vivid Purple
  '#0284c7', // Ocean Blue
  '#34d399', // Mint Teal
  '#f59e0b', // Deep Amber
  '#c084fc', // Soft Violet
  '#06b6d4', // Bright Teal
];

/**
 * Pre-calculated contrast maps for N indicators (N = 1 to 10).
 * Interleaves contrasting tones so that adjacent donut segments always have high contrast.
 */
const CONTRAST_PRESETS: Record<number, string[]> = {
  1: ['#00e5ff'],
  2: ['#00e5ff', '#10b981'],
  3: ['#00e5ff', '#10b981', '#fbbf24'],
  4: ['#00e5ff', '#10b981', '#a855f7', '#fbbf24'],
  5: ['#00e5ff', '#10b981', '#a855f7', '#fbbf24', '#38bdf8'],
  6: ['#00e5ff', '#10b981', '#a855f7', '#fbbf24', '#38bdf8', '#34d399'],
  7: ['#00e5ff', '#10b981', '#a855f7', '#fbbf24', '#38bdf8', '#34d399', '#c084fc'],
  8: ['#00e5ff', '#10b981', '#a855f7', '#fbbf24', '#38bdf8', '#34d399', '#c084fc', '#0284c7'],
  9: ['#00e5ff', '#10b981', '#a855f7', '#fbbf24', '#38bdf8', '#34d399', '#c084fc', '#0284c7', '#f59e0b'],
  10: ['#00e5ff', '#10b981', '#a855f7', '#fbbf24', '#38bdf8', '#34d399', '#c084fc', '#0284c7', '#f59e0b', '#06b6d4'],
};

/**
 * Returns a dynamically selected palette array for any indicator count.
 * Guarantees high dark-light contrast between adjacent slices.
 */
export function getContrastPalette(count: number): string[] {
  if (count <= 0) return CONTRAST_PRESETS[4];
  if (CONTRAST_PRESETS[count]) return CONTRAST_PRESETS[count];

  // Fallback for N > 10 using modulo looping over the 10-color interleaved preset
  const base10 = CONTRAST_PRESETS[10];
  return Array.from({ length: count }, (_, i) => base10[i % base10.length]);
}
