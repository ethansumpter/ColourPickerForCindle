import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import { useUploadFile } from 'react-firebase-hooks/storage';
import { storage } from '@/lib/firebase/config';
import { UploadStatus } from "@/components/UploadStatus";

interface ImageUploaderProps {
  onImageUploaded?: (url: string) => void;
}

export function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadFile, uploading, snapshot, error] = useUploadFile();

  // Clean up object URL when component unmounts or when image changes
  useEffect(() => {
    if (image) {
      const objectUrl = URL.createObjectURL(image);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [image]);

  const uploadToFirebase = async (file: File) => {
    const fileRef = storageRef(storage, `uploads/${file.name}`);
    try {
      const result = await uploadFile(fileRef, file, {
        contentType: file.type
      });
      if (result) {
        console.log('Upload successful:', result);
        const downloadUrl = await getDownloadURL(result.ref);
        onImageUploaded?.(downloadUrl);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      uploadToFirebase(file);
    }
  }, [uploadFile, onImageUploaded]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      uploadToFirebase(file);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="w-full max-w-2xl mx-auto p-8 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors"
    >
      <UploadStatus error={error} uploading={uploading} snapshot={snapshot} />
      
      {preview ? (
        <div className="relative w-full aspect-video">
          <Image
            src={preview}
            alt="Uploaded image"
            fill
            className="object-contain"
          />
        </div>
      ) : (
        <div className="text-center p-8">
          <p className="text-muted-foreground">
            Drag and drop an image here, or click below to select a file
          </p>
        </div>
      )}
      <div className="mt-4 flex justify-center">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <Button asChild>
          <label htmlFor="file-upload">
            {preview ? "Choose Different Image" : "Select Image"}
          </label>
        </Button>
      </div>
    </div>
  );
}