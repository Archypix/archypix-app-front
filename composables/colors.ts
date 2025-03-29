export const PREDEFINED_COLORS = [
  [217, 234, 245],   // Light Blue
  [255, 223, 223],   // Light Red
  [220, 245, 220],   // Light Green
  [255, 255, 204],   // Light Yellow
  [230, 216, 233],   // Light Purple
  [255, 228, 196],   // Light Orange
  [240, 240, 240],   // Light Gray
  [255, 240, 245],   // Light Pink

  [135, 206, 235],   // Medium-Light Blue
  [255, 182, 193],   // Medium-Light Red
  [144, 238, 144],   // Medium-Light Green
  [255, 250, 205],   // Medium-Light Yellow
  [216, 191, 216],   // Medium-Light Purple
  [255, 218, 185],   // Medium-Light Orange
  [192, 192, 192],   // Medium-Light Gray
  [255, 192, 203],   // Medium-Light Pink

  [100, 149, 237],   // Medium Blue
  [255, 105, 180],   // Medium Red
  [60, 179, 113],    // Medium Green
  [255, 215, 0],     // Medium Yellow
  [186, 85, 211],    // Medium Purple
  [255, 165, 0],     // Medium Orange
  [128, 128, 128],   // Medium Gray
  [255, 105, 180],   // Medium Pink

  [0, 0, 139],       // Dark Blue
  [139, 0, 0],       // Dark Red
  [0, 100, 0],       // Dark Green
  [139, 139, 0],     // Dark Yellow
  [75, 0, 130],      // Dark Purple
  [139, 69, 19],     // Dark Orange
  [64, 64, 64],      // Dark Gray
  [139, 0, 139]      // Dark Pink
];


export function getNextAvailableColor(usedColors: number[][]): number[] {
  // Convert used colors to strings for comparison
  const usedColorStrings = usedColors.map(color => color.join(','));

  // Find the first color that isn't in the used colors list
  for (const color of PREDEFINED_COLORS) {
    if (!usedColorStrings.includes(color.join(','))) {
      return color;
    }
  }

  // If all predefined colors are used, return the first one
  return PREDEFINED_COLORS[0];
}
