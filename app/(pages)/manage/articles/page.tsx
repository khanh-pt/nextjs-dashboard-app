import Search from '@/app/manage/components/articles//search';
import Table from '@/app//manage/components/articles/table';
import { CreateCustomer } from '@/app/learning/ui/customers/buttons';
import { lusitana } from '@/app/learning/ui/fonts';
import { ArticlesTableSkeleton } from '@/app/manage/components/articles/skeletons';
import { Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Articles',
};

export default async function Page(props: {
  searchParams: Promise<{
    query?: string;
    currentPage?: string;
    limit?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Articles</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 mt-8">
        <Search placeholder="Search article..." />
        <CreateCustomer />
      </div>
      <Suspense
        key={searchParams.currentPage}
        fallback={<ArticlesTableSkeleton />}
      >
        <Table searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
