'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { EFileRole } from '@/app/user/types/file';

// Calculate file checksum (SHA-256)
async function calculateFileChecksum(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface ImageUploadProps {
  defaultFileId?: number;
  defaultImageKey?: string;
  defaultRole: EFileRole;
  defaultImageUrl?: string;
  defaultFilename?: string;
  defaultFileSize?: number;
}

export interface ImageUploadRef {
  uploadImage: () => Promise<
    { key: string; fileId: number; role: string } | undefined
  >;
}

const ImageUpload = forwardRef<ImageUploadRef, ImageUploadProps>(
  (
    {
      defaultFileId = '',
      defaultImageKey = '',
      defaultRole,
      defaultImageUrl = '',
      defaultFilename = '',
      defaultFileSize = 0,
    },
    ref,
  ) => {
    const [uploading, setUploading] = useState(false);
    const [fileId, setFileId] = useState(defaultFileId);
    const [imageKey, setImageKey] = useState(defaultImageKey);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
      defaultImageUrl,
    );
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [successUpload, setSuccessUpload] = useState<Boolean>(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setError(null);
      setSelectedFile(file);

      // Create preview URL for better UX
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    };

    // Expose upload function to parent component
    const uploadImage = async (): Promise<
      { key: string; fileId: number; role: string } | undefined
    > => {
      if (!selectedFile) return;

      console.log('Uploading file:', selectedFile);
      setUploading(true);
      setError(null);

      try {
        // Step 1: Get presigned URL from backend with checksum
        const response = await fetch(`/api/upload/presigned-url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: selectedFile.name,
            contentType: selectedFile.type,
            checksum: await calculateFileChecksum(selectedFile),
            size: selectedFile.size,
          }),
        });

        if (!response.ok) {
          setError(
            'Failed to get upload URL from server! ' + response.statusText,
          );
          setUploading(false);
          return;
        }

        const {
          fileId,
          key,
          exists,
          uploadUrl,
        }: { fileId: number; key: string; exists: boolean; uploadUrl: string } =
          await response.json();

        if (exists) {
          // File already exists on GCS (deduplication)
          return { key, fileId, role: defaultRole };
        }

        // Step 2: Upload file to GCS using presigned URL
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': selectedFile.type,
            'x-goog-content-length-range': `0,${selectedFile.size}`,
          },
          body: selectedFile,
        });

        if (!uploadResponse.ok) {
          setError(
            `Failed to upload file to storage! ${uploadResponse.statusText}`,
          );
        }

        setFileId(fileId);
        setImageKey(key);
        setSelectedFile(null);
        setUploading(false);
        setSuccessUpload(true);
        return { fileId, key, role: defaultRole };
      } catch (err) {
        setError(
          `Failed to upload image. Please try again. ${(err as Error).message}`,
        );
        setUploading(false);
      }
    };

    // Expose uploadImage function to parent via ref
    useImperativeHandle(ref, () => ({
      uploadImage,
    }));

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            {previewUrl ? (
              <div className="relative w-full h-full">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain p-2 rounded-lg"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <PhotoIcon className="w-12 h-12 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
            <input
              id="image-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>
        {previewUrl && (
          <div className="flex items-center">
            <span className="text-blue-600 p-1">
              {selectedFile?.name || defaultFilename} (
              {selectedFile?.size || defaultFileSize} bytes)
            </span>
            <TrashIcon
              className="w-5 text-red-600 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewUrl(null);
                setSelectedFile(null);
                setError(null);
              }}
            />
          </div>
        )}

        {uploading && (
          <p className="text-sm text-blue-600">Uploading image...</p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {successUpload && (
          <p className="text-sm text-green-600">Image uploaded successfully!</p>
        )}
      </div>
    );
  },
);

ImageUpload.displayName = 'ImageUpload';

export default ImageUpload;
