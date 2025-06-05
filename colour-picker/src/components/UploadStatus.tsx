import { UploadTaskSnapshot } from "firebase/storage";

interface UploadStatusProps {
  error: Error | undefined;
  uploading: boolean;
  snapshot: UploadTaskSnapshot | undefined;
}

export function UploadStatus({ error, uploading, snapshot }: UploadStatusProps) {
  if (!error && !uploading) return null;

  return (
    <>
      {error && (
        <div className="text-red-500 mb-4 text-center">
          Error: {error.message}
        </div>
      )}
      {uploading && (
        <div className="text-blue-500 mb-4 text-center">
          Uploading... {snapshot && `${Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)}%`}
        </div>
      )}
    </>
  );
} 