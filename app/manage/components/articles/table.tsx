import DeleteArticleForm from './delete-form';
import { GetAllArticles } from '@/app/manage/types/articles';
import { UpdateInvoice } from '@/app/learning/ui/invoices/buttons';
import { LIMIT } from '@/app/manage/consts/articles';
import Pagination from '@/app/learning/ui/invoices/pagination';
import { apiFetch } from '@/app/common/fetch';

export default async function Table({
  searchParams,
}: {
  searchParams: {
    query?: string;
    currentPage?: string;
    limit?: string;
  };
}) {
  // {
  //   slug: string;
  //   title: string;
  //   description: string;
  //   body: string;
  //   tagList: string[];
  //   createdAt: string;
  //   updatedAt: string;
  //   favorited: boolean;
  //   favoritesCount: number;
  //   author: {
  //     username: string;
  //     bio: string | null;
  //     image: string | null;
  //     following: boolean;
  //   };
  // }
  const query = searchParams.query || '';
  const currentPage = Number(searchParams.currentPage) || 1;
  const limit = Number(searchParams.limit) || LIMIT;

  const res = await apiFetch(
    `${process.env.NEST_BE_URL}/articles?limit=${limit}&offset=${
      (currentPage - 1) * limit
    }`,
  );
  if (!res.ok) {
    throw new Error(`${res.status} - ${res.statusText}`);
  }

  const data: { articles: GetAllArticles[]; articlesCount: number } =
    await res.json();
  console.log({ data });
  const articles = data.articles;
  const totalPages = Math.ceil(Number(data.articlesCount) / limit);

  return (
    <div className="w-full">
      <div className="mt-6 flow-root">
        <div className="">
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-md bg-gray-50 p-2 md:pt-0">
              <table className="min-w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-2 py-2 font-medium">
                      Title
                    </th>
                    <th scope="col" className="px-2 py-2 font-medium">
                      Slug
                    </th>
                    <th scope="col" className="px-2 py-2 font-medium">
                      Description
                    </th>
                    <th scope="col" className="px-2 py-2 font-medium w-[500px]">
                      Body
                    </th>
                    <th scope="col" className="px-2 py-2 font-medium">
                      tagList
                    </th>
                    <th scope="col" className="relative py-3 pl-6 pr-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {articles.map((article) => (
                    <tr key={article.slug} className="group">
                      {/* <td className="whitespace-nowrap bg-white py-2 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <Image
                            src={article.image_url}
                            className="rounded-full"
                            alt={`${article.title}'s profile picture`}
                            width={28}
                            height={28}
                          />
                          <p>{article.title}</p>
                        </div>
                      </td> */}
                      <td className="bg-white px-2 py-2 text-sm">
                        {article.title}
                      </td>
                      <td className="bg-white px-2 py-2 text-sm">
                        {article.slug}
                      </td>
                      <td className="bg-white px-2 py-2 text-sm">
                        {article.description}
                      </td>
                      <td className="bg-white px-2 py-2 text-sm">
                        {article.body}
                      </td>
                      <td className="bg-white px-2 py-2 text-sm ">
                        {article.tagList.join(', ')}
                      </td>
                      <td className="bg-white px-2 py-2 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        <div className="flex justify-end gap-3"></div>
                      </td>
                      <td className="bg-white py-3 pl-6 pr-3">
                        <div className="flex justify-end gap-3">
                          <UpdateInvoice id={article.slug} />
                          <DeleteArticleForm slug={article.slug} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
