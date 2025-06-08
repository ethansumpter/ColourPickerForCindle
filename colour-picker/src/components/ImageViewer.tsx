import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ColorSelector } from "./ColorSelector";
import { ColorMixture } from "./ColorMixture";
import { ZoomIn, ZoomOut } from "lucide-react";

interface ImageViewerProps {
  imageUrl: string;
  onReset: () => void;
}

interface ColorResponse {
  name: {
    value: string;
  };
}

interface Color {
  name: string;
  hex: string;
  rgb: string;
}

interface Position {
  x: number;
  y: number;
}

export function ImageViewer({ imageUrl, onReset }: ImageViewerProps) {
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const [colorName, setColorName] = useState<string | null>(null);
  const [isPickerActive, setIsPickerActive] = useState(false);
  const [selectedColors, setSelectedColors] = useState<Color[]>([]);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset position when zoom returns to 1
    if (zoom <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Calculate boundaries based on zoom level
    const container = containerRef.current;
    if (container) {
      const bounds = {
        x: container.clientWidth * (zoom - 1) / 2,
        y: container.clientHeight * (zoom - 1) / 2
      };
      
      // Constrain movement within bounds
      const constrainedX = Math.max(-bounds.x, Math.min(bounds.x, newX));
      const constrainedY = Math.max(-bounds.y, Math.min(bounds.y, newY));
      
      setPosition({
        x: constrainedX,
        y: constrainedY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  useEffect(() => {
    const fetchColorName = async () => {
      if (!currentColor) {
        setColorName(null);
        return;
      }

      try {
        const hex = currentColor.replace('#', '');
        const response = await fetch(`https://www.thecolorapi.com/id?hex=${hex}`);
        const data: ColorResponse = await response.json();
        setColorName(data.name.value);
      } catch (error) {
        console.error('Error fetching color name:', error);
      }
    };

    fetchColorName();
  }, [currentColor]);

  const openEyeDropper = async () => {
    if (!window.EyeDropper) {
      alert('Your browser does not support the EyeDropper API');
      return;
    }

    try {
      setIsPickerActive(true);
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      setCurrentColor(result.sRGBHex);
    } catch (error) {
      console.log('Color picking cancelled');
    } finally {
      setIsPickerActive(false);
    }
  };

  const handleColorsChange = (colors: Color[]) => {
    setSelectedColors(colors);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full gap-4">
      {/* Image section - full width on mobile, 60% on desktop */}
      <div className="w-full lg:w-3/5 h-[50vh] lg:h-full relative rounded-lg overflow-hidden border border-border">
        <div 
          ref={containerRef}
          className="relative w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <div 
            className="absolute w-full h-full"
            style={{ 
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            <Image
              src={imageUrl}
              alt="Uploaded image"
              fill
              className="object-contain"
              priority
              draggable={false}
            />
          </div>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-black/75 text-white rounded-md hover:bg-black/90 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-black/75 text-white rounded-md hover:bg-black/90 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={openEyeDropper}
            disabled={isPickerActive}
            className="px-4 py-2 bg-black/75 text-white rounded-md hover:bg-black/90 transition-colors disabled:opacity-50"
          >
            {isPickerActive ? 'Selecting...' : 'Pick Color'}
          </button>
        </div>
      </div>

      {/* Color section - full width on mobile, 40% on desktop */}
      <div className="w-full lg:w-2/5 bg-card rounded-lg p-4 border border-border flex flex-col min-h-0">
        <div className="flex flex-col h-full gap-6 overflow-y-auto">
          <div>
            <h2 className="text-xl font-semibold mb-4">Selected Color</h2>
            {currentColor ? (
              <div className="flex flex-col gap-2">
                <div 
                  className="w-[calc(100%-10px)] h-[50px] mx-[5px] rounded-md border border-border"
                  style={{ backgroundColor: currentColor }}
                />
                <span className="text-center font-mono text-lg">
                  {colorName}
                </span>
                <span className="text-center font-mono text-sm text-muted-foreground">{currentColor}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center text-muted-foreground">
                No color selected
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Winsor & Newton Colors</h2>
            <ColorSelector onColorsChange={handleColorsChange} targetColor={currentColor} />
          </div>

          <div className="flex-1">
            <ColorMixture targetColor={currentColor} selectedColors={selectedColors} />
          </div>

          <button
            onClick={onReset}
            className="mt-auto w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors"
          >
            Upload New Image
          </button>
        </div>
      </div>
    </div>
  );
}