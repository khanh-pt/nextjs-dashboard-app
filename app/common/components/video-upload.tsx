'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import {
  PhotoIcon,
  TrashIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { EFileRole } from '@/app/user/types/file';

// Calculate file checksum (SHA-256)
async function calculateFileChecksum(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface VideoUploadProps {
  defaultFileId?: number;
  defaultVideoKey?: string;
  defaultRole: EFileRole;
  defaultVideoUrl?: string;
  defaultFilename?: string;
  defaultFileSize?: number;
}

export interface VideoUploadRef {
  uploadVideo: () => Promise<
    { key: string; fileId: number; role: string } | undefined
  >;
}

const VideoUpload = forwardRef<VideoUploadRef, VideoUploadProps>(
  (
    {
      defaultFileId = '',
      defaultVideoKey = '',
      defaultRole = EFileRole.VIDEOS,
      defaultVideoUrl = '',
      defaultFilename = '',
      defaultFileSize = 0,
    },
    ref,
  ) => {
    const [uploading, setUploading] = useState(false);
    const [fileId, setFileId] = useState(defaultFileId);
    const [videoKey, setVideoKey] = useState(defaultVideoKey);
    const [videoSrc, setVideoSrc] = useState<string | null>(defaultVideoUrl);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [successUpload, setSuccessUpload] = useState<Boolean>(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }

      // Validate file size (max 200MB)
      if (file.size > 200 * 1024 * 1024) {
        setError('File size must be less than 200MB');
        return;
      }

      setError(null);
      setSelectedFile(file);

      const objectUrl = URL.createObjectURL(file);
      setVideoSrc(objectUrl);
    };

    // Expose upload function to parent component
    const uploadVideo = async (): Promise<
      { key: string; fileId: number; role: string } | undefined
    > => {
      if (!selectedFile)
        return { key: videoKey, fileId: +fileId, role: defaultRole };

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
          let errors = {};
          if (response.status === 422) {
            const resJson = await response.json();
            errors = resJson.details?.reduce((acc: any, curr: any) => {
              if (!acc[curr.property]) {
                acc[curr.property] = [];
              }
              acc[curr.property].push(curr.message);
              return acc;
            }, {} as Record<string, string[]>);
          }

          setError(
            'Failed to get upload URL from server! ' + JSON.stringify(errors),
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
        setVideoKey(key);
        setSelectedFile(null);
        setUploading(false);
        setSuccessUpload(true);
        return { fileId, key, role: defaultRole };
      } catch (err) {
        setError(
          `Failed to upload video. Please try again. ${(err as Error).message}`,
        );
        setUploading(false);
      }
    };

    // Expose uploadVideo function to parent via ref
    useImperativeHandle(ref, () => ({
      uploadVideo: uploadVideo,
    }));

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="video-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <VideoCameraIcon className="w-12 h-12 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">MP4 up to 5MB</p>
            </div>
            <input
              id="video-upload"
              type="file"
              className="hidden"
              accept="video/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>

        {uploading && (
          <p className="text-sm text-blue-600">Uploading video...</p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {successUpload && (
          <p className="text-sm text-green-600">Video uploaded successfully!</p>
        )}
        <div className="flex justify-center">
          {videoSrc && (
            <video src={videoSrc} controls className="w-[500px] h-auto" />
          )}
        </div>
        {videoSrc && (
          <div className="flex items-center">
            <span className="text-blue-600 p-1">
              {selectedFile?.name || defaultFilename} (
              {selectedFile?.size || defaultFileSize} bytes)
            </span>
            <TrashIcon
              className="w-5 text-red-600 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setVideoSrc(null);
                setSelectedFile(null);
                setError(null);
              }}
            />
          </div>
        )}
      </div>
    );
  },
);

VideoUpload.displayName = 'VideoUpload';

export default VideoUpload;
