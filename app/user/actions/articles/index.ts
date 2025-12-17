'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { apiFetch } from '@/app/common/fetch';
import { getCookie } from '@/app/common/cookie';
import { EFileRole } from '@/app/user/types/file';

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
  fileId: z.string().optional(),
  key: z.string().optional(),
  role: z.string().optional(),
});

export type State = {
  formData: {
    title?: string;
    description?: string;
    body?: string;
    fileId?: number;
    key?: string;
    role?: EFileRole;
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
const UpdateArticle = FormSchema.omit({ id: true });
const DeleteArticle = FormSchema.pick({
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
    let errors = {};
    if (res.status === 422) {
      const resJson = await res.json();
      errors = resJson.details?.reduce((acc: any, curr: any) => {
        if (!acc[curr.property]) {
          acc[curr.property] = [];
        }
        acc[curr.property].push(curr.message);
        return acc;
      }, {} as Record<string, string[]>);
    }

    return {
      formData: Object.fromEntries(formData.entries()),
      errors,
      message: 'Failed to create article.',
    } as State;
  }

  redirect('/articles');
}

export async function updateArticle(
  slug: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateArticle.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validatedFields.success) {
    return {
      formData: Object.fromEntries(formData.entries()),
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Article.',
    } as State;
  }

  const data = validatedFields.data;

  const res = await apiFetch(`${process.env.NEST_BE_URL}/articles/${slug}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ article: data }),
  });

  if (!res.ok) {
    let errors = {};
    if (res.status === 422) {
      const resJson = await res.json();
      errors = resJson.details?.reduce((acc: any, curr: any) => {
        if (!acc[curr.property]) {
          acc[curr.property] = [];
        }
        acc[curr.property].push(curr.message);
        return acc;
      }, {} as Record<string, string[]>);
    }

    return {
      formData: Object.fromEntries(formData.entries()),
      errors,
      message: 'Failed to update article.',
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
