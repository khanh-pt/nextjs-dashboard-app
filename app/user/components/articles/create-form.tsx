'use client';

import { Button } from '@/app/learning/ui/button';
import { createArticle, State } from '@/app/user/actions/articles';
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from 'react';
import ImageUpload, {
  ImageUploadRef,
} from '@/app/common/components/image-upload';

export default function CreateForm() {
  const imageUploadRef = useRef<ImageUploadRef>(null);

  const initialState: State = {
    formData: {},
    message: null,
    errors: {},
  };
  const [state, formAction, isPending] = useActionState(
    createArticle,
    initialState,
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const formData = new FormData(event.target as HTMLFormElement);

      // Upload image first if one is selected
      if (imageUploadRef.current) {
        const result = await imageUploadRef.current.uploadImage();
        console.log('Image upload result:', result);
        if (result) {
          formData.append('key', result.key);
          formData.append('fileId', result.fileId.toString());
          formData.append('role', result.role);
        }
      }

      console.log('Form Data Entries:', Array.from(formData.entries()));

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
        {state.message && (
          <p className="mb-4 text-sm text-red-500">{state.message}</p>
        )}
        {/* title field */}
        <div>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Enter article title"
            defaultValue={state.formData.title}
          />
          {state.errors.title && (
            <div className="text-red-500">
              {state.errors.title.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
        </div>
        {/* description field */}
        <div>
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            placeholder="Enter article description"
            defaultValue={state.formData.description}
          />
          {state.errors.description && (
            <div className="text-red-500">
              {state.errors.description.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
        </div>

        {/* body field */}
        <div>
          <label htmlFor="body">Body</label>
          <textarea
            id="body"
            name="body"
            placeholder="Enter article body"
            defaultValue={state.formData.body}
          ></textarea>
          {state.errors.body && (
            <div className="text-red-500">
              {state.errors.body.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
        </div>

        {/* tagList field */}
        <div>
          <label htmlFor="tagList">Tags (comma separated)</label>
          <input
            type="text"
            id="tagList"
            name="tagList"
            placeholder="Enter tags"
          />
          {state.errors.tagList && (
            <div className="text-red-500">
              {state.errors.tagList.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
        </div>

        {/* Customer Image */}
        <div className="mb-4">
          <label
            htmlFor="image_upload"
            className="mb-2 block text-sm font-medium"
          >
            Customer Image
          </label>
          <ImageUpload
            ref={imageUploadRef}
            defaultFileId={undefined}
            defaultImageKey={undefined}
            defaultRole="thumbnails"
          />
        </div>

        <div className="mt-4">
          {isPending ? (
            <p>Creating article...</p>
          ) : (
            <Button type="submit">Create Article</Button>
          )}
        </div>
      </div>
    </form>
  );
}
