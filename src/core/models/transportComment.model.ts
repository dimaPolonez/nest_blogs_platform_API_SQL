import { MyLikeStatus } from './getPost.model';

export type UpdateCommentType = {
  content: string;
};

export type UpdateLikeStatusCommentType = {
  likeStatus: MyLikeStatus;
};

export type UpdateArrayCommentsType = {
  commentID: string;
  likesCount: number;
  dislikesCount: number;
};
