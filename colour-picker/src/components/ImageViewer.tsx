import { useState } from "react";
import Image from "next/image";

interface ImageViewerProps {
  imageUrl: string;
  onReset: () => void;
}

export function ImageViewer({ imageUrl, onReset }: ImageViewerProps) {
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const [isPickerActive, setIsPickerActive] = useState(false);

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

  return (
    <div className="flex w-full h-[calc(100vh-12rem)] gap-4">
      {/* Image section - 75% width */}
      <div className="w-3/4 relative rounded-lg overflow-hidden border border-border">
        <div className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt="Uploaded image"
            fill
            className="object-contain"
            priority
          />
        </div>
        <button
          onClick={openEyeDropper}
          disabled={isPickerActive}
          className="absolute top-4 right-4 px-4 py-2 bg-black/75 text-white rounded-md hover:bg-black/90 transition-colors disabled:opacity-50"
        >
          {isPickerActive ? 'Selecting...' : 'Pick Color'}
        </button>
      </div>

      {/* Color section - 25% width */}
      <div className="w-1/4 bg-card rounded-lg p-4 border border-border">
        <div className="flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-4">Selected Color</h2>
          {currentColor ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div 
                className="w-32 h-32 rounded-lg border border-border"
                style={{ backgroundColor: currentColor }}
              />
              <span className="font-mono text-lg">{currentColor}</span>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              No color selected
            </div>
          )}
          <button
            onClick={onReset}
            className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors"
          >
            Upload New Image
          </button>
        </div>
      </div>
    </div>
  );
} 