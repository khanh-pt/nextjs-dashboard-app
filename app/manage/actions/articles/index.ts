'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/app/common/fetch';

const ArticleFormSchema = z.object({
  // id: z.string(),
  slug: z.string(),
  // length name must be at least 1 character
  // name: z.string().min(1, { message: 'Please enter a name.' }),
  // email: z.string().email({ message: 'Please enter a valid email.' }),
  // image_key: z.string().optional(),
});

export type ArticleState = {
  formData: {
    slug?: string;
  };
  errors: {
    slug?: string[];
  };
  message: string | null;
};

const DeleteArticle = ArticleFormSchema.pick({ slug: true });

export async function deleteArticle(
  prevState: ArticleState,
  formData: FormData,
) {
  const validatedFields = DeleteArticle.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validatedFields.success) {
    return {
      formData: Object.fromEntries(formData.entries()),
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Delete Article.',
    } as ArticleState;
  }

  const data = validatedFields.data;

  const res = await apiFetch(
    `${process.env.NEST_BE_URL}/articles/${data.slug}`,
    {
      method: 'DELETE',
    },
  );
  if (!res.ok) {
    throw new Error(`${res.status} - ${res.statusText}`);
  }

  redirect('/manage/articles');
}
