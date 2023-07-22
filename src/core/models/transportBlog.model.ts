export type CreateBlogType = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type CreatePostOfBlogType = {
  title: string;
  shortDescription: string;
  content: string;
};

export type UpdatePostOfBlogType = {
  title: string;
  shortDescription: string;
  content: string;
};

export type UpdateBlogType = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type BindBlogType = {
  userId: string;
  userLogin: string;
};

export type QueryBlogType = {
  searchNameTerm: string;
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
};

export type QueryPostOfBlogType = {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
};

export type BanBlogType = {
  isBanned: boolean;
};
