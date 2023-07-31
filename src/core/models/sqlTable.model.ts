import { MyLikeStatus } from './getPost.model';

export enum TablesNames {
  Users = 'Users',
  Blogs = 'Blogs',
  Posts = 'Posts',
  Comments = 'Comments',
  SessionsUsersInfo = 'SessionsUsersInfo',
  BanAllUsersOfBlogInfo = 'BanAllUsersOfBlogInfo',
  ExtendedLikesPostInfo = 'ExtendedLikesPostInfo',
  ExtendedLikesCommentInfo = 'ExtendedLikesCommentInfo',
}

export type UsersTableType = {
  id: string;
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
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  userOwnerId: string;
  userOwnerLogin: string;
  blogIsBanned: boolean;
  banDate: string;
};

export type PostsTableType = {
  id: string;
  blogId: string;
  blogName: string;
  title: string;
  shortDescription: string;
  content: string;
  createdAt: string;
};

export type CommentsTableType = {
  id: string;
  userOwnerId: string;
  postId: string;
  content: string;
  createdAt: string;
};

export type SessionsUsersInfoType = {
  id: string;
  userId: string;
  ip: string;
  title: string;
  sessionExpired: string;
  lastActiveDate: string;
};

export type BanAllUsersOfBlogInfoType = {
  id: string;
  blogId: string;
  userId: string;
  banDate: string;
  banReason: string;
};

export type ExtendedLikesPostInfoType = {
  id: string;
  userOwnerId: string;
  postId: string;
  status: MyLikeStatus;
  addedAt: string;
};

export type ExtendedLikesCommentInfoType = {
  id: string;
  userOwnerId: string;
  commentId: string;
  status: MyLikeStatus;
  addedAt: string;
};
