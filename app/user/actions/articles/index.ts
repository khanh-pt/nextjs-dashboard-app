'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { apiFetch } from '@/app/common/fetch';
import { getCookie } from '@/app/common/cookie';

const FormSchema = z.object({
  id: z.string(),
  title: z.string().min(1, { message: 'Please enter a title.' }),
  description: z.string().min(1, { message: 'Please enter a description.' }),
  body: z.string().min(1, { message: 'Please enter the body content.' }),
  tagList: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : [],
    ),
});

export type State = {
  formData: {
    title?: string;
    description?: string;
    body?: string;
    tagList?: string[];
  };
  errors: {
    title?: string[];
    description?: string[];
    body?: string[];
    tagList?: string[];
  };
  message: string | null;
};

const CreateArticle = FormSchema.omit({ id: true });
const UpdateInvoice = FormSchema.omit({ id: true });
const DeleteInvoice = FormSchema.pick({
  id: true,
});

export async function createArticle(prevState: State, formData: FormData) {
  const validatedFields = CreateArticle.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validatedFields.success) {
    return {
      formData: Object.fromEntries(formData.entries()),
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Article.',
    } as State;
  }

  const data = validatedFields.data;

  const res = await apiFetch(`${process.env.NEST_BE_URL}/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ article: data }),
  });

  if (!res.ok) {
    const resJson = await res.json();
    console.log({ resJson });

    return {
      formData: Object.fromEntries(formData.entries()),
      errors: resJson.details,
      message: 'Failed to create article.',
    } as State;
  }

  redirect('/articles');
}

export const favoriteArticle = async (slug: string, refreshUrl: string) => {
  const accessToken = await getCookie('accessToken');

  if (!accessToken) {
    return {
      message: 'You must be logged in to perform this action.',
      success: false,
    };
  }

  const res = await apiFetch(
    `${process.env.NEST_BE_URL}/articles/${slug}/favorite`,
    {
      method: 'POST',
    },
  );

  if (!res.ok) {
    return {
      message: `${res.status} - ${res.statusText}`,
      success: false,
    };
  } else {
    revalidatePath(refreshUrl);
    return {
      message: 'Article favorited successfully.',
      success: true,
    };
  }
};

export const unFavoriteArticle = async (slug: string, refreshUrl: string) => {
  const accessToken = await getCookie('accessToken');

  if (!accessToken) {
    return {
      message: 'You must be logged in to perform this action.',
      success: false,
    };
  }

  const res = await apiFetch(
    `${process.env.NEST_BE_URL}/articles/${slug}/favorite`,
    {
      method: 'DELETE',
    },
  );
  if (!res.ok) {
    return {
      message: `${res.status} - ${res.statusText}`,
      success: false,
    };
  } else {
    revalidatePath(refreshUrl);
    return {
      message: 'Article unfavorited successfully.',
      success: true,
    };
  }
};
