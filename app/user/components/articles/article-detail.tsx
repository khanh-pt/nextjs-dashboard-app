import Link from 'next/link';

import { TagList } from './tag-list';
import FavoriteArticleButton from './favorite-button';
import Image from 'next/image';
import { apiFetch } from '@/app/common/fetch';
import { notFound } from 'next/navigation';
import { TArticleApi } from '@/app/user/types/article';
import { TCurrentUser } from '@/app/user/types/current-user';
import { EFileRole } from '../../types/file';

export const ArticleDetail = async ({ slug }: { slug: string }) => {
  const res = await apiFetch(`${process.env.NEST_BE_URL}/articles/${slug}`);

  if (!res.ok) {
    notFound();
  }
  const {
    article,
    currentUser,
  }: { article: TArticleApi; currentUser?: TCurrentUser } = await res.json();

  const {
    title,
    description,
    body,
    tagList = [],
    favorited,
    favoritesCount,
    author,
    updatedAt,
  } = article;

  const thumbnailUrl = article.files?.find(
    (file) => file.role === EFileRole.THUMBNAILS,
  )?.url;

  const videoUrl = article.files?.find(
    (file) => file.role === EFileRole.VIDEOS,
  )?.url;

  return (
    <div className="my-4">
      {author.id === currentUser?.id && (
        <Link href={`/articles/${slug}/edit`} className="underline">
          Edit Article
        </Link>
      )}
      <div className="w-fit h-fit bg-transparent flex gap-1 items-center">
        {author && (
          <Link href={`/profile/${author.username}`}>
            {author.image ? (
              <Image
                src={author.image}
                alt={author.username}
                width={40}
                height={40}
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full" />
            )}
            {author.username}
          </Link>
        )}
      </div>
      <div className="flex justify-between items-center">
        <h2>{title}</h2>

        <FavoriteArticleButton
          slug={slug}
          haveText={false}
          favorite={favorited}
          favoritesCount={favoritesCount}
          refreshUrl="/"
        />
      </div>
      <TagList
        tagList={tagList}
        isClickable={true}
        innerClassName="cursor-pointer"
        className="py-1"
      />
      <Link href={`/articles/${slug}`}>
        <p className="opacity-65 font-light">
          {new Date(updatedAt).toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </p>
        <h1 className="text-2xl font-bold">{title}</h1>
        <h2 className={`text-zinc-400 font-extralight`}>{description}</h2>
        {thumbnailUrl && (
          <div className="relative w-full h-60 mt-2">
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-contain rounded-md"
            />
          </div>
        )}
      </Link>

      {videoUrl && (
        <div className="mt-5">
          <video src={videoUrl} controls className="w-[500px]" />
        </div>
      )}
      <div className="flex justify-between items-center p-0 m-0">
        <div>{body}</div>
      </div>
    </div>
  );
};
