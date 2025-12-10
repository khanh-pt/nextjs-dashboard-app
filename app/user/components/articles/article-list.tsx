import { apiFetch } from '@/app/common/fetch';
import { Article } from '@/app/user/components/articles/article';
import Pagination from '@/app/user/components/articles/pagination';

type TArticleListProps = {
  feed: any;
  page: number;
  tag: string | undefined;
  limit: number;
  offset: number;
  author: string | undefined;
  favorited: string | undefined;
};

export const ArticleList = async ({
  tag,
  page,
  feed,
  limit,
  offset,
  author,
  favorited,
}: TArticleListProps) => {
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
    ...(tag ? { tag } : {}),
    ...(author ? { author } : {}),
    ...(favorited ? { favorited } : {}),
  });

  const res = await apiFetch(
    `${process.env.NEST_BE_URL}/articles${
      feed == 1 ? '/feed' : ''
    }?${queryParams.toString()}`,
  );

  if (!res.ok) {
    throw new Error(`${res.status} - ${res.statusText}`);
  }

  const resJson = await res.json();
  const { articles, articlesCount } = resJson;
  const totalPages = Math.ceil(articlesCount / limit);
  console.log(articles);

  return (
    <>
      {articlesCount > 0 ? (
        <>
          <Pagination
            currentPage={page}
            limit={limit}
            totalPages={totalPages}
          />
          <div className="my-5">
            {articles.map((article: any, i: number) => (
              <Article
                key={i}
                slug={article.slug}
                title={article.title}
                lastModified={
                  article.updatedAt ? article.updatedAt : article.createdAt
                }
                imageSrc={article.author.image}
                description={article.description}
                username={article.author.username}
                favorited={article.favorited}
                favoritesCount={article.favoritesCount}
                tagList={article.tagList}
              />
            ))}
          </div>
          <Pagination
            currentPage={page}
            limit={limit}
            totalPages={totalPages}
          />
        </>
      ) : (
        <h1 className="w-fit mx-auto my-5">
          No article found with given parameter
        </h1>
      )}
    </>
  );
};
