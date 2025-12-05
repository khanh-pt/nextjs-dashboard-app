'use client';

import { ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useActionState } from 'react';
import { ArticleState, deleteArticle } from '@/app/manage/actions/articles';

export default function DeleteArticleForm({ slug }: { slug: string }) {
  const initialState: ArticleState = {
    formData: {},
    message: null,
    errors: {},
  };
  const [state, formAction, isPending] = useActionState(
    deleteArticle,
    initialState,
  );

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="slug" value={slug} />
        {isPending ? (
          <div className="rounded-md border p-2">
            <ArrowPathIcon className="w-5 animate-spin pointer-events-none" />
          </div>
        ) : (
          <button
            type="submit"
            className="rounded-md border p-2 hover:bg-gray-100"
          >
            <span className="sr-only">Delete</span>
            <TrashIcon className="w-5 text-red-600" />
          </button>
        )}
      </form>
    </>
  );
}
