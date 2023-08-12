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

export type CreateCommentOfPostType = {
  content: string;
};

export type UpdateLikeStatusPostType = {
  likeStatus: MyLikeStatus;
};
