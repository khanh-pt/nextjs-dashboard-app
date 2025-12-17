import { ArticleDetail } from '@/app/user/components/articles/article-detail';
import { Suspense } from 'react';

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main>
      <Suspense fallback={<div>Loading article...</div>}>
        <ArticleDetail slug={slug} />
      </Suspense>
    </main>
  );
}
