"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Check, ChevronsUpDown, X, Wand2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { isColorDark } from "@/lib/utils/colorUtils"
import { Color } from "@/types/color"
import { usePredictBestMix } from "@/components/PredictBestMix"

import colors from "@/data/winsorNewtonColors.json"

interface ColorSelectorProps {
  onColorsChange?: (colors: Color[]) => void;
  targetColor?: string | null;
}

// List of favourite color names
const favouriteColorNames = [
  "Cadmium Yellow",
  "Cadmium Free Red", 
  "Cobalt Blue",
  "Cobalt Blue Deep",
  "Purple Madder",
  "Mars Black",
  "Titanium White",
  "Burnt Umber",
  "Pale Rose Blush",
  "Magenta",
  "Indian Red"
];

// Create arrays for favourite and other colors
const favouriteColors = colors.filter(color => favouriteColorNames.includes(color.name));
const otherColors = colors.filter(color => !favouriteColorNames.includes(color.name));

export function ColorSelector({ onColorsChange, targetColor }: ColorSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedColors, setSelectedColors] = React.useState<Color[]>([])
  const [isPredicting, setIsPredicting] = React.useState(false)
  const [hasPredicted, setHasPredicted] = React.useState(false)
  const [predictionError, setPredictionError] = React.useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  const { predictBestMix } = usePredictBestMix({
    targetColor: targetColor ?? null,
    isClient,
    favouriteColors, // Only pass favourite colors now
    setSelectedColors,
    onColorsChange,
    setHasPredicted,
    setIsPredicting,
    setPredictionError,
  });

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Reset prediction state when target color changes
  useEffect(() => {
    setHasPredicted(false)
    setPredictionError(null)
  }, [targetColor])

  const handleColorSelect = (colorName: string) => {
    const color = colors.find((c) => c.name === colorName);
    if (color && !selectedColors.some(c => c.name === colorName)) {
      const newColors = [...selectedColors, color];
      setSelectedColors(newColors);
      onColorsChange?.(newColors);
      setHasPredicted(false); // Reset prediction state when colors change
      setPredictionError(null); // Clear any prediction errors
    }
    setOpen(false);
  };

  const removeColor = (e: React.MouseEvent, colorName: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newColors = selectedColors.filter((c) => c.name !== colorName);
    setSelectedColors(newColors);
    onColorsChange?.(newColors);
    setHasPredicted(false); // Reset prediction state when colors change
    setPredictionError(null); // Clear any prediction errors
  };

  const selectAllFavorites = () => {
    const newColors = [...selectedColors];
    favouriteColors.forEach(color => {
      if (!selectedColors.some(c => c.name === color.name)) {
        newColors.push(color);
      }
    });
    setSelectedColors(newColors);
    onColorsChange?.(newColors);
    setHasPredicted(false); // Reset prediction state when colors change
    setPredictionError(null); // Clear any prediction errors
    setOpen(false);
  };

  const areAllFavoritesSelected = favouriteColors.every(
    color => selectedColors.some(c => c.name === color.name)
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 w-full">
        <div className="flex-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedColors.length === 0 ? (
                  "Select a color..."
                ) : (
                  `${selectedColors.length} ${selectedColors.length === 1 ? 'color' : 'colors'} selected`
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search colors..." />
                <ScrollArea className="h-[300px]">
                  <CommandList>
                    <CommandEmpty>No color found.</CommandEmpty>
                    <CommandGroup heading={
                      <div className="flex w-full items-center justify-between">
                        <span>Favourites</span>
                        <span 
                          className="text-blue-600 font-medium cursor-pointer hover:text-blue-500"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            selectAllFavorites();
                          }}
                        >
                          Select All
                        </span>
                      </div>
                    }>
                      <CommandSeparator />
                      {favouriteColors.map((color) => (
                        <CommandItem
                          key={color.name}
                          value={color.name}
                          onSelect={handleColorSelect}
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: color.hex }}
                            />
                            {color.name}
                          </div>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              selectedColors.some(c => c.name === color.name) ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandGroup heading="All Colors">
                      {otherColors.map((color) => (
                        <CommandItem
                          key={color.name}
                          value={color.name}
                          onSelect={handleColorSelect}
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: color.hex }}
                            />
                            {color.name}
                          </div>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              selectedColors.some(c => c.name === color.name) ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </ScrollArea>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <Button
          variant={hasPredicted ? "default" : "outline"}
          size="icon"
          disabled={!isClient || !targetColor || isPredicting}
          onClick={() => predictBestMix()}
          className={cn(
            "shrink-0 transition-all duration-200",
            isPredicting && "!bg-muted !border-muted-foreground/20 cursor-not-allowed opacity-80 hover:!bg-muted hover:!text-muted-foreground",
            hasPredicted && "hover:!bg-primary/90"
          )}
          title={isPredicting ? "Predicting..." : "Predict Best Mix (Favourites Only)"}
        >
          <Wand2 className={cn(
            "h-4 w-4 transition-transform",
            isPredicting && "animate-spin"
          )} />
        </Button>
      </div>

      {/* Error Alert */}
      {predictionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {predictionError}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        {selectedColors.map((color) => (
          <Badge
            key={color.name}
            style={{
              backgroundColor: color.hex,
              color: isColorDark(color.hex) ? 'white' : 'black',
            }}
            className="flex items-center gap-1 pr-1.5"
          >
            <span className="mr-1">{color.name}</span>
            <button
              onClick={(e) => removeColor(e, color.name)}
              className="hover:bg-black/10 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}