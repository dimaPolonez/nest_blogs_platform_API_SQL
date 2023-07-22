import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GetAllCommentsType,
  GetAllPostsType,
  GetCommentOfPostType,
  GetCommentType,
  GetPostType,
  MyLikeStatus,
  NewestLikesType,
  QueryCommentType,
  QueryPostType,
} from '../../../core/models';
import {
  CommentModel,
  CommentModelType,
  PostModel,
  PostModelType,
} from '../../../core/entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(PostModel.name)
    private readonly PostModel: Model<PostModelType>,
    @InjectModel(CommentModel.name)
    private readonly CommentModel: Model<CommentModelType>,
  ) {}

  sortObject(sortDir: string) {
    return sortDir === 'desc' ? -1 : 1;
  }
  skippedObject(pageNum: number, pageSize: number) {
    return (pageNum - 1) * pageSize;
  }

  async findPostById(postID: string, userID?: string): Promise<GetPostType> {
    const findPostSmart = await this.PostModel.findById(postID);

    if (!findPostSmart || findPostSmart.blogIsBanned === true) {
      throw new NotFoundException('post not found');
    }

    let userStatus = MyLikeStatus.None;

    if (userID !== 'quest') {
      const findUserLike: null | NewestLikesType =
        findPostSmart.extendedLikesInfo.newestLikes.find(
          (v) => v.userId === userID,
        );

      if (findUserLike) {
        userStatus = findUserLike.myStatus;
      }
    }
    let newestLikesArray = [];

    if (findPostSmart.extendedLikesInfo.newestLikes.length > 0) {
      let newestLikes: NewestLikesType[] | [] =
        findPostSmart.extendedLikesInfo.newestLikes.filter(
          (v) => v.myStatus === MyLikeStatus.Like && v.isBanned === false,
        );

      newestLikes.sort(function (a: NewestLikesType, b: NewestLikesType) {
        return a.addedAt < b.addedAt ? 1 : a.addedAt > b.addedAt ? -1 : 0;
      });

      newestLikes = newestLikes.slice(0, 3);

      newestLikesArray = newestLikes.map((v: NewestLikesType) => {
        return {
          userId: v.userId,
          login: v.login,
          addedAt: v.addedAt,
        };
      });
    }

    return {
      id: findPostSmart.id,
      title: findPostSmart.title,
      shortDescription: findPostSmart.shortDescription,
      content: findPostSmart.content,
      blogId: findPostSmart.blogId,
      blogName: findPostSmart.blogName,
      createdAt: findPostSmart.createdAt,
      extendedLikesInfo: {
        likesCount: findPostSmart.extendedLikesInfo.likesCount,
        dislikesCount: findPostSmart.extendedLikesInfo.dislikesCount,
        myStatus: userStatus,
        newestLikes: newestLikesArray,
      },
    };
  }

  async getAllPosts(
    userID: string,
    queryAll: QueryPostType,
    blogID?: string,
  ): Promise<GetAllPostsType> {
    let findObject: object = { blogIsBanned: false };

    if (blogID) {
      findObject = { blogId: blogID, blogIsBanned: false };
    }

    const allPosts: PostModelType[] = await this.PostModel.find(findObject)
      .skip(this.skippedObject(queryAll.pageNumber, queryAll.pageSize))
      .limit(queryAll.pageSize)
      .sort({ [queryAll.sortBy]: this.sortObject(queryAll.sortDirection) });

    const allMapsPosts: GetPostType[] = allPosts.map((field) => {
      let userStatus = MyLikeStatus.None;

      if (userID !== 'quest') {
        const findUserLike: null | NewestLikesType =
          field.extendedLikesInfo.newestLikes.find((v) => v.userId === userID);

        if (findUserLike) {
          userStatus = findUserLike.myStatus;
        }
      }

      let newestLikesArray = [];

      if (field.extendedLikesInfo.newestLikes.length > 0) {
        let newestLikes: NewestLikesType[] | [] =
          field.extendedLikesInfo.newestLikes.filter(
            (v) => v.myStatus === MyLikeStatus.Like && v.isBanned === false,
          );

        newestLikes.sort(function (a: NewestLikesType, b: NewestLikesType) {
          return a.addedAt < b.addedAt ? 1 : a.addedAt > b.addedAt ? -1 : 0;
        });

        newestLikes = newestLikes.slice(0, 3);

        newestLikesArray = newestLikes.map((v: NewestLikesType) => {
          return {
            userId: v.userId,
            login: v.login,
            addedAt: v.addedAt,
          };
        });
      }

      return {
        id: field.id,
        title: field.title,
        shortDescription: field.shortDescription,
        content: field.content,
        blogId: field.blogId,
        blogName: field.blogName,
        createdAt: field.createdAt,
        extendedLikesInfo: {
          likesCount: field.extendedLikesInfo.likesCount,
          dislikesCount: field.extendedLikesInfo.dislikesCount,
          myStatus: userStatus,
          newestLikes: newestLikesArray,
        },
      };
    });

    const allCount: number = await this.PostModel.countDocuments(findObject);
    const pagesCount: number = Math.ceil(allCount / queryAll.pageSize);

    return {
      pagesCount: pagesCount,
      page: queryAll.pageNumber,
      pageSize: queryAll.pageSize,
      totalCount: allCount,
      items: allMapsPosts,
    };
  }
  async getAllCommentsOfPost(
    userID: string,
    postID: string,
    queryAll: QueryCommentType,
  ): Promise<GetAllCommentsType> {
    const allComments: CommentModelType[] = await this.CommentModel.find({
      $and: [{ postId: postID }, { 'commentatorInfo.isBanned': false }],
    })
      .skip(this.skippedObject(queryAll.pageNumber, queryAll.pageSize))
      .limit(queryAll.pageSize)
      .sort({ [queryAll.sortBy]: this.sortObject(queryAll.sortDirection) });

    const allMapsComments: GetCommentType[] = allComments.map((field) => {
      let userStatus = MyLikeStatus.None;

      if (userID !== 'quest') {
        const findUserLike: null | NewestLikesType =
          field.likesInfo.newestLikes.find((v) => v.userId === userID);

        if (findUserLike) {
          userStatus = findUserLike.myStatus;
        }
      }

      return {
        id: field.id,
        content: field.content,
        commentatorInfo: {
          userId: field.commentatorInfo.userId,
          userLogin: field.commentatorInfo.userLogin,
        },
        createdAt: field.createdAt,
        likesInfo: {
          likesCount: field.likesInfo.likesCount,
          dislikesCount: field.likesInfo.dislikesCount,
          myStatus: userStatus,
        },
      };
    });

    const allCount: number = await this.CommentModel.countDocuments({
      postId: postID,
    });

    const pagesCount: number = Math.ceil(allCount / queryAll.pageSize);

    return {
      pagesCount: pagesCount,
      page: queryAll.pageNumber,
      pageSize: queryAll.pageSize,
      totalCount: allCount,
      items: allMapsComments,
    };
  }
  async getCommentOfPost(
    commentID: string,
    userID?: string,
  ): Promise<GetCommentOfPostType> {
    const findCommentSmart = await this.CommentModel.findById(commentID);

    if (!findCommentSmart) {
      throw new NotFoundException('comment not found');
    }

    let userStatus = MyLikeStatus.None;

    if (userID !== 'quest') {
      const findUserLike: null | NewestLikesType =
        findCommentSmart.likesInfo.newestLikes.find((l) => l.userId === userID);

      if (findUserLike) {
        userStatus = findUserLike.myStatus;
      }
    }

    return {
      id: findCommentSmart.id,
      content: findCommentSmart.content,
      commentatorInfo: {
        userId: findCommentSmart.commentatorInfo.userId,
        userLogin: findCommentSmart.commentatorInfo.userLogin,
      },
      createdAt: findCommentSmart.createdAt,
      likesInfo: {
        likesCount: findCommentSmart.likesInfo.likesCount,
        dislikesCount: findCommentSmart.likesInfo.dislikesCount,
        myStatus: userStatus,
      },
    };
  }
}
