interface ColorListProps {
  colors: string[];
  onRemoveColor?: (index: number) => void;
}

export function ColorList({ colors, onRemoveColor }: ColorListProps) {
  if (colors.length === 0) {
    return (
      <p className="text-muted-foreground text-center">
        Hover over the image and click to pick colors
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {colors.map((color, index) => (
        <div
          key={`${color}-${index}`}
          className="group relative aspect-square rounded-lg overflow-hidden border border-border"
          onClick={() => onRemoveColor?.(index)}
        >
          <div
            className="w-full h-full"
            style={{ backgroundColor: color }}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-mono uppercase">
              {color}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
} 