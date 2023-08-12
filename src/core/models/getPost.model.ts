export enum MyLikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export type NewestLikesType = {
  myStatus: MyLikeStatus;
  isBanned: boolean;
  addedAt: string;
  userId: string;
  login: string;
};

type ExtendedLikesType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: MyLikeStatus;
  newestLikes: [] | NewestLikesType[];
};

export type GetPostType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesType;
};

export type GetPostOfBlogType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesType;
};

export type GetAllPostsOfBlogType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: GetPostOfBlogType[];
};

export type GetAllPostsType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: GetPostType[];
};

export type GetAllPostsToBloggerType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: GetPostToBloggerType[];
};

export type GetPostToBloggerType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesToBloggerType;
};

type ExtendedLikesToBloggerType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: MyLikeStatus;
  newestLikes: [] | NewestLikesToBloggerType[];
};

export type NewestLikesToBloggerType = {
  addedAt: string;
  userId: string;
  login: string;
};

type LikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: MyLikeStatus;
};

type CommentatorInfoType = {
  userId: string;
  userLogin: string;
};

export type GetCommentOfPostType = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoType;
  createdAt: string;
  likesInfo: LikesInfoType;
};

export type GetAllCommentsOfPostType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: GetCommentOfPostType[];
};

export type PostInfoType = {
  blogId: string;
  blogName: string;
  title: string;
  id: string;
};

export type GetAllCommentOfPostType = {
  id: string;
  content: string;
  createdAt: string;
  commentatorInfo: CommentatorInfoType;
  likesInfo: LikesInfoType;
  postInfo: PostInfoType;
};

export type GetAllCommentsToBloggerType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: GetAllCommentOfPostType[];
};
