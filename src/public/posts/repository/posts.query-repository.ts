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
  NewestLikesToBloggerType,
  NewestLikesType,
  QueryCommentType,
  QueryPostType,
  TablesNames,
} from '../../../core/models';
import {
  CommentModel,
  CommentModelType,
  PostModel,
  PostModelType,
} from '../../../core/entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
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
    const text = `SELECT Posts.*, Blogs."blogIsBanned" 
                   FROM "${TablesNames.Posts}" AS Posts
                   FULL JOIN "${TablesNames.Blogs}" AS Blogs
                   ON Posts."blogId" = Blogs.id
                   WHERE Posts.id = $1`;

    const values = [postID];

    const rawPost = await this.dataSource.query(text, values);

    if (rawPost.length < 1 || rawPost[0].blogIsBanned === true) {
      throw new NotFoundException('post not found');
    }

    return {
      id: rawPost[0].id,
      title: rawPost[0].title,
      shortDescription: rawPost[0].shortDescription,
      content: rawPost[0].content,
      blogId: rawPost[0].blogId,
      blogName: rawPost[0].blogName,
      createdAt: rawPost[0].createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: MyLikeStatus.None,
        newestLikes: [],
      },
    };

    /*
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
    }*/
  }

  async getAllPosts(
    userID: string,
    queryAll: QueryPostType,
    blogID?: string,
  ): Promise<GetAllPostsType> {
    const text2 = `SELECT Posts.*, Blogs."blogIsBanned" 
                   FROM "${TablesNames.Posts}" AS Posts
                   FULL JOIN "${TablesNames.Blogs}" AS Blogs
                   ON Posts."blogId" = Blogs.id`;

    const rawAllPosts = await this.dataSource.query(text2);

    const mappedAllPosts: GetPostType[] = rawAllPosts.map((field) => {
      const userStatus = MyLikeStatus.None;
      const newestLikesArray: NewestLikesToBloggerType[] = [];
      const likesCount = 0;
      const dislikesCount = 0;

      if (blogID && field.blogId === blogID && field.blogIsBanned === false) {
        return {
          id: field.id,
          title: field.title,
          shortDescription: field.shortDescription,
          content: field.content,
          blogId: field.blogId,
          blogName: field.blogName,
          createdAt: field.createdAt,
          extendedLikesInfo: {
            likesCount: likesCount,
            dislikesCount: dislikesCount,
            myStatus: userStatus,
            newestLikes: newestLikesArray,
          },
        };
      }
      if (field.blogIsBanned === false) {
        return {
          id: field.id,
          title: field.title,
          shortDescription: field.shortDescription,
          content: field.content,
          blogId: field.blogId,
          blogName: field.blogName,
          createdAt: field.createdAt,
          extendedLikesInfo: {
            likesCount: likesCount,
            dislikesCount: dislikesCount,
            myStatus: userStatus,
            newestLikes: newestLikesArray,
          },
        };
      }
    });

    const skip = this.skippedObject(queryAll.pageNumber, queryAll.pageSize);
    const limit = queryAll.pageSize;
    const sortBy = queryAll.sortBy;
    const sortDirections = queryAll.sortDirection;

    mappedAllPosts.sort((a: GetPostType, b: GetPostType) => {
      if (a[sortBy] < b[sortBy]) {
        return sortDirections === 'asc' ? -1 : 1;
      }
      if (a[sortBy] > b[sortBy]) {
        return sortDirections === 'asc' ? 1 : -1;
      }
      return 0;
    });

    const paginationFullPosts = mappedAllPosts.slice(skip, skip + limit);

    const allCount: number = mappedAllPosts.length;
    const pagesCount: number = Math.ceil(allCount / queryAll.pageSize);

    return {
      pagesCount: pagesCount,
      page: queryAll.pageNumber,
      pageSize: queryAll.pageSize,
      totalCount: allCount,
      items: paginationFullPosts,
    };

    /*const allMapsPosts: GetPostType[] = allPosts.map((field) => {
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
    });*/
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
