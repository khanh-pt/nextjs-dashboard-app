import { Suspense } from 'react';

import { Metadata } from 'next';

import { Loading } from '@/app/user/components/articles/loading';
import { PopularTag } from '@/app/user/components/articles/popular-tag';
import { ArticleList } from '@/app/user/components/articles/article-list';
import { ArticleHeader } from '@/app/user/components/articles/article-header';
import { getCookie } from '@/app/common/cookie';

export const metadata: Metadata = {
  title: 'Home — Conduit',
  description:
    'Conduit is realworld social blogging site. it uses a custom API for all requests, including authentication. home page of conduit',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    tag?: string;
    author?: string;
    favorited?: string;
    page?: string;
    limit?: string;
    offset?: string;
    feed?: string;
  }>;
}) {
  const accessToken = await getCookie('accessToken');

  const {
    page = 1,
    offset = 0,
    tag,
    limit = 10,
    author,
    favorited,
    feed,
  } = await searchParams;

  const articleHeaderElements = [
    {
      name: 'Global Feed',
      query: ``,
    },
  ];

  if (accessToken) {
    articleHeaderElements.unshift({
      name: 'Your Feed',
      query: `feed=1`,
    });
  }

  return (
    <main>
      <div className="min-w-full flex flex-col gap-5 md:flex-row  py-2 px-4 md:px-10 lg:px-14 mt-10">
        <div className="flex-1">
          <ArticleHeader choices={articleHeaderElements} />
          <Suspense fallback={<Loading />}>
            <ArticleList
              tag={tag}
              page={+page}
              feed={feed}
              limit={+limit}
              offset={+offset}
              author={author}
              favorited={favorited}
            />
          </Suspense>
        </div>
        <Suspense fallback={<Loading />}>
          <PopularTag />
        </Suspense>
      </div>
    </main>
  );
}
