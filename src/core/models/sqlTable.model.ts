import { EntityLikes, MyLikeStatus } from './getPost.model';

export type UsersTableType = {
  userId: string;
  login: string;
  hushPass: string;
  email: string;
  createdAt: string;
  userIsBanned: boolean;
  banDate: string;
  banReason: string;
  userIsConfirmed: boolean;
  codeActivated: string;
  codeActivatedExpired: string;
};

export type BlogsTableType = {
  blogId: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  userOwnerId: string;
  blogIsBanned: boolean;
  banDate: string;
};

export type PostsTableType = {
  postId: string;
  blogId: string;
  title: string;
  shortDescription: string;
  content: string;
  createdAt: string;
};

export type CommentsTableType = {
  commentId: string;
  userOwnerId: string;
  postId: string;
  content: string;
  createdAt: string;
};

export type SessionsUsersInfoType = {
  sessionId: string;
  userId: string;
  ip: string;
  title: string;
  sessionExpired: string;
  lastActiveDate: string;
};

export type BanAllUsersOfBlogInfoType = {
  banId: string;
  blogId: string;
  userId: string;
  banDate: string;
  banReason: string;
};

export type ExtendedLikesInfoType = {
  likeId: string;
  userOwnerId: string;
  entity: EntityLikes;
  entityId: string;
  status: MyLikeStatus;
  addedAt: string;
};