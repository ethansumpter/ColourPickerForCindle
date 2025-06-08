"use client"

import { useMemo, useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Info } from "lucide-react"
import { Color } from "@/types/color"
import { hexToRgb, rgbToHex, getMixedColor, calculateAccuracy, findOptimalRatios } from "@/lib/utils/colorUtils"

interface ColorMixtureProps {
  targetColor: string | null;
  selectedColors: Color[];
}

export function ColorMixture({ targetColor, selectedColors }: ColorMixtureProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const mixingResult = useMemo(() => {
    if (!isClient || !targetColor || selectedColors.length < 2) return null;
    
    try {
      const targetRgb = hexToRgb(targetColor);
      const [ratios, accuracy] = findOptimalRatios(targetRgb, selectedColors);
      const mixedRgb = getMixedColor(selectedColors, ratios);
      const mixedHex = rgbToHex(mixedRgb);

      return {
        ratios,
        mixedColor: mixedHex,
        accuracy
      };
    } catch (error) {
      console.error('Error calculating mixture:', error);
      return null;
    }
  }, [isClient, targetColor, selectedColors]);

  // Always render the same structure to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Color Mixture</h3>
          <Info className="h-4 w-4 text-muted-foreground opacity-0" />
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded-lg animate-pulse" />
          <div className="space-y-1">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!targetColor || selectedColors.length < 2) {
    if (selectedColors.length === 1) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Color Mixture</h3>
          <p className="text-sm text-muted-foreground">
            Please select at least one more color to calculate the mixture.
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Color Mixture</h3>
        <p className="text-sm text-muted-foreground">
          Select at least two colors to see the mixture calculation.
        </p>
      </div>
    );
  }

  if (!mixingResult) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Color Mixture</h3>
        <p className="text-sm text-muted-foreground">
          Unable to calculate mixture. Please try again.
        </p>
      </div>
    );
  }

  // Filter out colors with very small ratios (less than 1%)
  const significantMixes = selectedColors
    .map((color, index) => ({
      color,
      ratio: mixingResult.ratios[index] * 100
    }))
    .filter(mix => mix.ratio >= 1)
    .sort((a, b) => b.ratio - a.ratio);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Color Mixture</h3>
        <HoverCard>
          <HoverCardTrigger>
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Target Color</p>
                  <div 
                    className="w-12 h-12 rounded-md border"
                    style={{ backgroundColor: targetColor }}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Mixed Result</p>
                  <div 
                    className="w-12 h-12 rounded-md border"
                    style={{ backgroundColor: mixingResult.mixedColor }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Match Accuracy</span>
                  <span>{mixingResult.accuracy.toFixed(1)}%</span>
                </div>
                <Progress value={mixingResult.accuracy} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground">
                The accuracy is calculated using Delta E (CIE76), the industry standard for measuring perceptual color differences in Lab color space.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      <div className="space-y-2">
        <div className="h-8 flex rounded-lg overflow-hidden">
          {significantMixes.map(({ color, ratio }, index) => (
            <div
              key={color.name}
              style={{
                backgroundColor: color.hex,
                width: `${ratio}%`
              }}
              className="h-full first:rounded-l-lg last:rounded-r-lg"
            />
          ))}
        </div>
        <div className="space-y-1">
          {significantMixes.map(({ color, ratio }) => (
            <div key={color.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color.hex }}
                />
                <span>{color.name}</span>
              </div>
              <span>{ratio.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}