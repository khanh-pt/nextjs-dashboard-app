import { apiFetch } from '@/app/common/fetch';
import { TagList } from './tag-list';

export const PopularTag = async () => {
  const res = await apiFetch(`${process.env.NEST_BE_URL}/tags`);
  if (!res.ok) {
    throw new Error(`${res.status} - ${res.statusText}`);
  }
  const resData: { tags: string[] } = await res.json();

  return (
    <div className="bg-slate-100 shadow-custom rounded p-3 h-fit md:w-72">
      <h1>Popular Tags</h1>
      <TagList
        isClickable
        tagList={resData.tags}
        className="p-0 md:px-0 lg:px-0 mt-2"
        innerClassName="cursor-pointer bg-gray-500 opacity-90 hover:opacity-100 text-white border-none"
      />
    </div>
  );
};
