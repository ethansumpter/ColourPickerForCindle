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
    <main className="flex min-h-screen flex-col items-center p-24 gap-8">
      <h1 className="text-4xl font-bold">Colour Picker</h1>
      {uploadedImageUrl ? (
        <ImageViewer imageUrl={uploadedImageUrl} onReset={handleReset} />
      ) : (
        <ImageUploader onImageUploaded={handleImageUploaded} />
      )}
    </main>
  );
}
