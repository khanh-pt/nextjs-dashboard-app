import { apiFetch } from '@/app/common/fetch';
import ArticleVideoEditForm from '@/app/user/components/articles/article-video-edit-form';
import { TArticleApi } from '@/app/user/types/article';
import { notFound } from 'next/navigation';

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

  const { article }: { article: TArticleApi } = await res.json();

  return (
    <main>
      <ArticleVideoEditForm article={article} />
    </main>
  );
}
