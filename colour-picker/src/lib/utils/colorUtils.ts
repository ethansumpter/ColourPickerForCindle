import { Color } from "@/types/color";

// Convert hex to RGB
export function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

// Convert RGB to hex
export function rgbToHex(rgb: [number, number, number]): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}

// Convert RGB to Lab color space
export function rgbToLab(rgb: [number, number, number]): [number, number, number] {
  // First convert RGB to XYZ
  let r = rgb[0] / 255;
  let g = rgb[1] / 255;
  let bVal = rgb[2] / 255;

  // Convert to sRGB
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  bVal = bVal > 0.04045 ? Math.pow((bVal + 0.055) / 1.055, 2.4) : bVal / 12.92;

  // Convert to XYZ
  const x = (r * 0.4124 + g * 0.3576 + bVal * 0.1805) * 100;
  const y = (r * 0.2126 + g * 0.7152 + bVal * 0.0722) * 100;
  const z = (r * 0.0193 + g * 0.1192 + bVal * 0.9505) * 100;

  // Convert XYZ to Lab
  const xn = 95.047;
  const yn = 100.0;
  const zn = 108.883;

  const fx = x / xn > 0.008856 ? Math.pow(x / xn, 1/3) : (7.787 * x / xn) + 16/116;
  const fy = y / yn > 0.008856 ? Math.pow(y / yn, 1/3) : (7.787 * y / yn) + 16/116;
  const fz = z / zn > 0.008856 ? Math.pow(z / zn, 1/3) : (7.787 * z / zn) + 16/116;

  const L = (116 * fy) - 16;
  const a = 500 * (fx - fy);
  const bComponent = 200 * (fy - fz);

  return [L, a, bComponent];
}

// Convert Lab to RGB color space
export function labToRgb(lab: [number, number, number]): [number, number, number] {
  const [L, a, b] = lab;
  
  // Convert Lab to XYZ
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;
  
  const xn = 95.047;
  const yn = 100.0;
  const zn = 108.883;
  
  const x = (fx > 0.206897 ? Math.pow(fx, 3) : (fx - 16/116) / 7.787) * xn;
  const y = (fy > 0.206897 ? Math.pow(fy, 3) : (fy - 16/116) / 7.787) * yn;
  const z = (fz > 0.206897 ? Math.pow(fz, 3) : (fz - 16/116) / 7.787) * zn;
  
  // Convert XYZ to RGB
  let r = (x * 0.032406 + y * -0.015372 + z * -0.004986) / 100;
  let g = (x * -0.009689 + y * 0.018758 + z * 0.000415) / 100;
  let bVal = (x * 0.000557 + y * -0.002040 + z * 0.010570) / 100;
  
  // Convert to sRGB
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
  bVal = bVal > 0.0031308 ? 1.055 * Math.pow(bVal, 1/2.4) - 0.055 : 12.92 * bVal;
  
  return [
    Math.max(0, Math.min(255, Math.round(r * 255))),
    Math.max(0, Math.min(255, Math.round(g * 255))),
    Math.max(0, Math.min(255, Math.round(bVal * 255)))
  ];
}

// Calculate color accuracy percentage
export function calculateAccuracy(targetRgb: [number, number, number], mixedRgb: [number, number, number]): number {
  const maxDistance = Math.sqrt(
    2 * 255 * 255 + // Red (weighted by 2)
    4 * 255 * 255 + // Green (weighted by 4)
    3 * 255 * 255   // Blue (weighted by 3)
  );
  const distance = colorDistance(targetRgb, mixedRgb);
  return Math.max(0, Math.min(100, (1 - distance / maxDistance) * 100));
}

// Helper function to calculate color distance
function colorDistance(color1: [number, number, number], color2: [number, number, number]): number {
  const rDiff = color1[0] - color2[0];
  const gDiff = color1[1] - color2[1];
  const bDiff = color1[2] - color2[2];

  return Math.sqrt(
    2 * rDiff * rDiff +  // Red is weighted more
    4 * gDiff * gDiff +  // Green is weighted most
    3 * bDiff * bDiff    // Blue is weighted medium
  );
}

// Calculate mixed color from ratios using RGB mixing (more intuitive for paint mixing)
export function getMixedColor(colors: Color[], ratios: number[]): [number, number, number] {
  // Use simple RGB averaging for more predictable paint mixing results
  let r = 0, g = 0, b = 0;
  let totalRatio = 0;

  colors.forEach((color, i) => {
    const ratio = ratios[i];
    const rgb = hexToRgb(color.hex);
    r += rgb[0] * ratio;
    g += rgb[1] * ratio;
    b += rgb[2] * ratio;
    totalRatio += ratio;
  });

  // Normalize
  if (totalRatio > 0) {
    r /= totalRatio;
    g /= totalRatio;
    b /= totalRatio;
  }

  return [
    Math.max(0, Math.min(255, Math.round(r))),
    Math.max(0, Math.min(255, Math.round(g))),
    Math.max(0, Math.min(255, Math.round(b)))
  ];
}

// Alternative: Calculate mixed color using Lab color space for more accurate color mixing
export function getMixedColorLab(colors: Color[], ratios: number[]): [number, number, number] {
  // Convert all colors to Lab space for better mixing
  const labColors = colors.map(color => rgbToLab(hexToRgb(color.hex)));
  
  // Mix in Lab space
  let L = 0, a = 0, b = 0;
  let totalRatio = 0;

  colors.forEach((_, i) => {
    const ratio = ratios[i];
    L += labColors[i][0] * ratio;
    a += labColors[i][1] * ratio;
    b += labColors[i][2] * ratio;
    totalRatio += ratio;
  });

  // Normalize
  const mixedLab: [number, number, number] = [
    L / totalRatio,
    a / totalRatio,
    b / totalRatio
  ];

  // Convert back to RGB using proper Lab-to-RGB conversion
  return labToRgb(mixedLab);
}

// Helper function to determine if a color is dark (for text contrast)
export function isColorDark(hex: string): boolean {
  const rgb = hexToRgb(hex);
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return brightness < 128;
}

// Find optimal mixing ratios using a simple genetic algorithm
export function findOptimalRatios(targetRgb: [number, number, number], colors: Color[], iterations = 1000): [number[], number] {
  const populationSize = 100;
  const mutationRate = 0.1;
  let bestOverallRatios: number[] = [];
  let bestOverallAccuracy = 0;

  let population = Array(populationSize).fill(null).map(() => {
    const ratios = Array(colors.length).fill(0).map(() => Math.random());
    const sum = ratios.reduce((a, b) => a + b, 0);
    return ratios.map(r => r / sum); // Normalize
  });

  for (let i = 0; i < iterations; i++) {
    // Evaluate fitness
    const fitnessResults = population.map(ratios => {
      const mixed = getMixedColor(colors, ratios);
      const accuracy = calculateAccuracy(targetRgb, mixed);
      return { ratios, accuracy };
    });

    // Find best solution in this generation
    const bestSolution = fitnessResults.reduce((best, current) => 
      current.accuracy > best.accuracy ? current : best
    , fitnessResults[0]);

    // Update best overall solution
    if (bestSolution.accuracy > bestOverallAccuracy) {
      bestOverallAccuracy = bestSolution.accuracy;
      bestOverallRatios = bestSolution.ratios;

      // Early exit conditions
      if (bestOverallAccuracy >= 80) {
        return [bestOverallRatios, bestOverallAccuracy];
      }
      if (bestOverallAccuracy >= 70 && i > iterations / 2) {
        return [bestOverallRatios, bestOverallAccuracy];
      }
    }

    // Sort by fitness for selection
    fitnessResults.sort((a, b) => b.accuracy - a.accuracy);
    
    // Keep best 20%
    const bestRatios = fitnessResults.slice(0, populationSize * 0.2).map(r => r.ratios);
    
    // Generate new population
    population = [...bestRatios];
    while (population.length < populationSize) {
      const parent1 = bestRatios[Math.floor(Math.random() * bestRatios.length)];
      const parent2 = bestRatios[Math.floor(Math.random() * bestRatios.length)];
      
      // Crossover
      const child = parent1.map((r, i) => {
        const ratio = Math.random() < 0.5 ? r : parent2[i];
        // Mutation
        return Math.random() < mutationRate ? ratio * (0.8 + Math.random() * 0.4) : ratio;
      });
      
      // Normalize
      const sum = child.reduce((a, b) => a + b, 0);
      population.push(child.map(r => r / sum));
    }
  }

  return [bestOverallRatios, bestOverallAccuracy];
}

// Optimized function for favourite colors only with tiered accuracy requirements
export function findOptimalRatiosFavourites(
  targetRgb: [number, number, number], 
  favoriteColors: Color[], 
  targetAccuracy = 65,
  maxIterations = 500
): [number[], number, Color[]] {
  let bestOverallRatios: number[] = [];
  let bestOverallAccuracy = 0;
  let bestCombination: Color[] = [];

  const getCombinations = (arr: Color[], size: number): Color[][] => {
    if (size === 1) return arr.map((value) => [value]);
    if (size > arr.length) return [];
    
    const combinations: Color[][] = [];
    arr.forEach((value, index) => {
      const remaining = arr.slice(index + 1);
      const subCombinations = getCombinations(remaining, size - 1);
      subCombinations.forEach((subComb) => {
        combinations.push([value, ...subComb]);
      });
    });
    return combinations;
  };

  // Try combinations of 2, 3, and 4 colors
  for (const size of [2, 3, 4]) {
    const combinations = getCombinations(favoriteColors, size);
    
    for (const combination of combinations) {
      // Use fewer iterations for speed
      const [ratios, accuracy] = findOptimalRatios(targetRgb, combination, maxIterations);
      
      if (accuracy > bestOverallAccuracy) {
        bestOverallAccuracy = accuracy;
        bestOverallRatios = ratios;
        bestCombination = combination;
        
        // Early exit if we hit target accuracy
        if (accuracy >= targetAccuracy) {
          return [bestOverallRatios, bestOverallAccuracy, bestCombination];
        }
      }
    }
    
    // If we found good enough accuracy with fewer colors, don't try more complex combinations
    if (bestOverallAccuracy >= targetAccuracy) {
      break;
    }
  }

  return [bestOverallRatios, bestOverallAccuracy, bestCombination];
}
