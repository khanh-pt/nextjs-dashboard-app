export type TArticleApi = {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  favorited: boolean;
  favoritesCount: number;
  files: {
    id: number;
    key: string;
    filename: string;
    contentType: string;
    url: string;
    byteSize: number;
    role: string;
    createdAt: string;
    updatedAt: string;
  }[];
  author: {
    id: number;
    username: string;
    bio: string | null;
    image: string | null;
    following: boolean;
  };
  createdAt: string;
  updatedAt: string;
};
