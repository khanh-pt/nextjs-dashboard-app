import { apiFetch } from '@/app/common/fetch';
import ArticleEditForm from '@/app/user/components/articles/article-edit-form';
import { TArticleProps } from '@/app/user/types/article';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await apiFetch(`${process.env.NEST_BE_URL}/articles/${slug}`);

  if (!res.ok) {
    notFound();
  }

  const { article }: { article: TArticleProps } = await res.json();

  return (
    <main>
      <ArticleEditForm article={article} />
    </main>
  );
}
