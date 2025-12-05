'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

// import {
//   Pagination,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationPrevious,
// } from '@/components/ui/pagination';
import { clsx } from 'clsx';

type TPaginationComponents = {
  page: number;
  offset: number;
  articlesCount: number;
};

export const PaginationComponent = ({
  page,
  offset,
  articlesCount,
}: TPaginationComponents) => {
  const [limit, setLimit] = useState(page);
  const path = usePathname();
  const router = useRouter();
  const param = useSearchParams();
  const params = new URLSearchParams(param.toString());

  let paginationLimit: number = Math.ceil(articlesCount / 10);
  const setQuery = (
    params: URLSearchParams,
    elements: { key: string; value: any }[],
  ) => {
    elements.map((element) => {
      params.set(element.key, element.value);
    });

    return params.toString();
  };

  useEffect(() => {
    if (limit > paginationLimit) {
      setLimit(paginationLimit);
      const result = setQuery(params, [
        { key: 'page', value: limit },
        { key: 'offset', value: (limit - 1) * 10 },
      ]);

      router.push(`${path}?${result}`);
    } else if (limit < 1) {
      const result = setQuery(params, [
        { key: 'page', value: 1 },
        { key: 'offset', value: 0 },
      ]);
      router.push(`${path}?${result}`);
    } else if (offset / 10 + 1 !== limit) {
      const result = setQuery(params, [
        { key: 'page', value: limit },
        { key: 'offset', value: (limit - 1) * 10 },
      ]);
      router.push(`${path}?${result}`);
    }
  }, []);

  let paginationElements: number[] = [];
  let paginationEnd: number =
    page > 10 ? page : paginationLimit < 10 ? paginationLimit : 10;
  let paginationStart: number = page > 10 ? page - 9 : 1;

  for (let i = paginationStart; i <= paginationEnd; i++) {
    paginationElements.push(i);
  }

  const onPaginationClick = (page: number) => {
    const result = setQuery(params, [
      { key: 'page', value: page },
      { key: 'offset', value: (page - 1) * 10 },
    ]);
    router.push(`${path}?${result}`);
  };
  const onNextClick = () => {
    let nextPage = +page + 1;
    const result = setQuery(params, [{ key: 'page', value: nextPage }]);

    if (nextPage <= paginationLimit) router.push(`${path}?${result}`);
  };
  const onPrevClick = () => {
    let prevPage = +page - 1;
    const result = setQuery(params, [{ key: 'page', value: prevPage }]);
    if (prevPage >= 1) router.push(`${path}?${result}`);
  };

  return (
    <Pagination>
      <PaginationContent className="flex-wrap gap-0">
        <PaginationItem>
          <PaginationPrevious
            onClick={onPrevClick}
            className={clsx(
              'cursor-pointer bg-transparent border p-1 hover:bg-gray-300 focus:bg-green-custom focus:text-white rounded-none rounded-l',
              page == 1 && 'hidden',
            )}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis
            className={clsx(
              'bg-transparent  p-1 h-10  border',

              paginationStart === 1 && 'hidden',
            )}
          />
        </PaginationItem>
        {paginationElements.map((element) => (
          <PaginationItem key={element}>
            <PaginationLink
              onClick={() => onPaginationClick(element)}
              className={clsx(
                'bg-transparent border p-1 rounded-none cursor-pointer hover:bg-gray-300 ',
                page == element && 'bg-green-custom text-white',
              )}
            >
              {element}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationEllipsis
            className={clsx(
              'bg-transparent  p-1 h-10  border',

              paginationEnd == paginationLimit && 'hidden',
            )}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            onClick={onNextClick}
            className={clsx(
              'cursor-pointer bg-transparent border p-1 hover:bg-gray-300 focus:bg-green-custom focus:text-white rounded-none rounded-r',
              page == paginationLimit && 'hidden',
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={clsx('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={clsx('flex flex-row items-center gap-1', className)}
    {...props}
  />
));

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={clsx('', className)} {...props} />
));

type PaginationLinkProps = {
  isActive?: boolean;
} & React.ComponentProps<'a'>;

const PaginationLink = ({
  className,
  isActive,
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={clsx(className, isActive ? 'outline' : 'ghost')}
    {...props}
  />
);

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    className={clsx('gap-1 pl-2.5', className)}
    {...props}
  >
    <ArrowLeftIcon className="h-4 w-4" />
  </PaginationLink>
);

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    className={clsx('gap-1 pr-2.5', className)}
    {...props}
  >
    <ArrowRightIcon className="h-4 w-4" />
  </PaginationLink>
);

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={clsx('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    {/* <MoreHorizontal className="h-4 w-4" /> */}
    More icon
    <span className="sr-only">More pages</span>
  </span>
);
