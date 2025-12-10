import Link from 'next/link';

import { TagList } from './tag-list';
import FavoriteArticleButton from './favorite-button';
import Image from 'next/image';

type TArticleProps = {
  lastModified: string;
  slug: string;
  title: string;
  username: string;
  imageSrc: string | null;
  tagList: string[];
  favorited: boolean;
  description: string;
  favoritesCount: number;
};

export const Article = ({
  lastModified,
  slug,
  title,
  username,
  imageSrc,
  tagList,
  favorited,
  description,
  favoritesCount,
}: TArticleProps) => {
  return (
    <div className="flex flex-col gap-4 group/item my-4">
      <div className="flex justify-between items-center">
        <div className="w-fit h-fit bg-transparent flex gap-1 items-center">
          <Link href={`/profile/${username}`}>
            {imageSrc ? (
              <Image src={imageSrc} alt={username} width={40} height={40} />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full" />
            )}
            {username}
          </Link>
        </div>
        <FavoriteArticleButton
          slug={slug}
          haveText={false}
          favorite={favorited}
          favoritesCount={favoritesCount}
          refreshUrl="/"
        />
      </div>
      <Link href={`/article/${slug}`}>
        <p className="opacity-65 font-light">
          {new Date(lastModified).toLocaleString('vi-VN', {
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
      </Link>
      <div className="flex justify-between items-center p-0 m-0">
        <Link href={`/article/${slug}`}>
          <span className="text-sm text-zinc-400">Read more...</span>
        </Link>
        <TagList
          tagList={tagList}
          isClickable={true}
          innerClassName="cursor-pointer"
          className="py-1"
        />
      </div>
    </div>
  );
};
