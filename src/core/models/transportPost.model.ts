import { MyLikeStatus } from './getPost.model';

export type QueryPostType = {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
};

export type QueryCommentType = {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
};

export type UpdatePostType = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName?: string;
};

export type UpdateArrayPostsType = {
  postID: string;
  likesCount: number;
  dislikesCount: number;
};

export type CreateCommentOfPostType = {
  content: string;
};

export type NewCommentObjectType = {
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  postId: string;
};

export type UpdateLikeStatusPostType = {
  likeStatus: MyLikeStatus;
};
