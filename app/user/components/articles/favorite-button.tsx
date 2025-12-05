'use client';

import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

import {
  favoriteArticle,
  unFavoriteArticle,
} from '@/app/user/actions/articles';
import { useActionState } from 'react';

type TFavoriteArticleButtonProps = {
  slug: string;
  favorite: boolean;
  haveText: boolean;
  refreshUrl: string;
  favoritesCount: number;
};
const FavoriteArticleButton = ({
  slug,
  favorite,
  haveText,
  refreshUrl,
  favoritesCount,
}: TFavoriteArticleButtonProps) => {
  const initialState: { message: string | null; success: boolean } = {
    message: null,
    success: false,
  };
  const [state, formAction, isPending] = useActionState(
    favorite
      ? unFavoriteArticle.bind(null, slug, refreshUrl)
      : favoriteArticle.bind(null, slug, refreshUrl),
    initialState,
  );

  return (
    <form action={formAction}>
      <button>
        {favorite ? (
          <HeartIconSolid height={30} width={30} className="text-[#ff0000]" />
        ) : (
          <HeartIconOutline height={30} width={30} className="text-[#ff0000]" />
        )}
        <span>
          {haveText
            ? favorite
              ? `UnFavorite Article (${favoritesCount})`
              : `Favorite Article (${favoritesCount})`
            : favoritesCount}
        </span>
      </button>
      {state.message && !state.success && (
        <p className="text-red-500 text-xs mt-1">{state.message}</p>
      )}
    </form>
  );
};

export default FavoriteArticleButton;
