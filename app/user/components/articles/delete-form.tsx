'use client';

import { deleteInvoice, State } from '@/app/learning/lib/actions';
import { ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useActionState } from 'react';

export default function DeleteInvoiceForm({ id }: { id: string }) {
  const initialState: State = {
    formData: {},
    message: null,
    errors: {},
  };
  const [state, formAction, isPending] = useActionState(
    deleteInvoice,
    initialState,
  );

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
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
