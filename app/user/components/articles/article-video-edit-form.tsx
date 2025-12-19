'use client';

import { Button } from '@/app/learning/ui/button';
import { State, updateArticle } from '@/app/user/actions/articles';
import { startTransition, useActionState, useRef } from 'react';
import { TArticleApi } from '@/app/user/types/article';
import { EFileRole } from '@/app/user/types/file';
import VideoUpload, {
  VideoUploadRef,
} from '@/app/common/components/video-upload';

export default function ArticleVideoEditForm({
  article,
}: {
  article: TArticleApi;
}) {
  const { slug, title } = article;

  const { id, key, role, url, filename, byteSize } = article.files?.find(
    (file) => file.role === EFileRole.VIDEOS,
  ) || { fileId: undefined, key: undefined, role: undefined };

  const videoUploadRef = useRef<VideoUploadRef>(null);

  const initialState: State = {
    formData: {
      fileId: id,
      key,
      role: role as EFileRole,
    },
    message: null,
    errors: {},
  };
  const [state, formAction, isPending] = useActionState(
    updateArticle.bind(null, slug),
    initialState,
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const formData = new FormData(event.target as HTMLFormElement);

      // Upload video first if one is selected
      if (videoUploadRef.current) {
        const result = await videoUploadRef.current.uploadVideo();
        if (result) {
          formData.append('key', result.key);
          formData.append('fileId', result.fileId.toString());
          formData.append('role', result.role);
        }
      }

      console.log(
        'Submitting form with data:',
        Object.fromEntries(formData.entries()),
      );

      // Now submit the form inside startTransition
      startTransition(() => {
        formAction(formData);
      });
    } catch (error) {
      console.error('Error during form submission:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h2>Edit Video Article: {title}</h2>
        {/* Customer Video */}
        <div className="mb-4">
          <label
            htmlFor="video_upload"
            className="mb-2 block text-sm font-medium"
          >
            Customer Video
          </label>
          <VideoUpload
            ref={videoUploadRef}
            defaultFileId={state.formData.fileId}
            defaultVideoKey={state.formData.key}
            defaultRole={state.formData.role as EFileRole}
            defaultVideoUrl={url}
            defaultFilename={filename}
            defaultFileSize={byteSize}
          />
        </div>

        <div className="mt-4">
          {isPending ? (
            <p>Updating article...</p>
          ) : (
            <Button type="submit">Update Article</Button>
          )}
        </div>
      </div>
    </form>
  );
}
