"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { ImageViewer } from "@/components/ImageViewer";

export default function Home() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleImageUploaded = (url: string) => {
    console.log('Image uploaded to:', url);
    setUploadedImageUrl(url);
  };

  const handleReset = () => {
    setUploadedImageUrl(null);
  };

  return (
    <main className="flex h-screen flex-col items-center p-4 sm:p-8 lg:p-24 overflow-hidden">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8">Colour Picker</h1>
      <div className="w-full flex-1 min-h-0">
        {uploadedImageUrl ? (
          <ImageViewer imageUrl={uploadedImageUrl} onReset={handleReset} />
        ) : (
          <ImageUploader onImageUploaded={handleImageUploaded} />
        )}
      </div>
    </main>
  );
}
