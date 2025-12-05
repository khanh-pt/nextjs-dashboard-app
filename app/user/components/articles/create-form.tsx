'use client';
import { CustomerField } from '@/app/learning/lib/definitions';
import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/learning/ui/button';
import { createArticle, State } from '@/app/user/actions/articles';
import { useActionState, useEffect, useRef, useState } from 'react';
import { Dropdown } from '../../../learning/ui/customers/dropdown';

export default function CreateForm() {
  const initialState: State = {
    formData: {},
    message: null,
    errors: {},
  };
  const [state, formAction, isPending] = useActionState(
    createArticle,
    initialState,
  );

  return (
    <form action={formAction}>
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
