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

  async getAllPostsToBlog(
    userID: string,
    queryAll: QueryPostType,
    blogID: string,
  ) /*: Promise<GetAllPostsType>*/ {
    const text1 = `SELECT * FROM "${TablesNames.Blogs}" WHERE id = $1`;

    const values1 = [blogID];

    const rawBlog = await this.dataSource.query(text1, values1);

    if (rawBlog.length < 1) {
      throw new NotFoundException('blog not found');
    }

    const text = `SELECT p.*,
                  (SELECT COUNT(*) AS "likesCount" FROM "${TablesNames.ExtendedLikesPostInfo}"
                  FULL JOIN "${TablesNames.Users}" AS u ON "userOwnerId" = u.id
                  WHERE status = 'Like' AND "postId" = p.id AND u."userIsBanned" = false),
                  (SELECT COUNT(*)  AS "dislikesCount" FROM "${TablesNames.ExtendedLikesPostInfo}"
                  FULL JOIN "${TablesNames.Users}" AS u ON "userOwnerId" = u.id 
                  WHERE status = 'Dislike' AND "postId" = p.id AND u."userIsBanned" = false),
                  (SELECT status FROM "${TablesNames.ExtendedLikesPostInfo}" 
                  WHERE "userOwnerId" = $1 AND "postId" = p.id),
                  (SELECT COUNT(*) as "allCount" FROM "${TablesNames.Posts}" 
                  FULL JOIN "${TablesNames.Blogs}" AS b ON "blogId" = b.id
                  WHERE "blogId" = $2 AND b."blogIsBanned" = false),
                  (SELECT ARRAY_TO_JSON(ARRAY( SELECT ROW_TO_JSON(r) FROM (SELECT "addedAt", "userOwnerId" AS "userId", "userOwnerLogin" AS "login") 
                  FROM "${TablesNames.ExtendedLikesPostInfo}"
                  FULL JOIN "${TablesNames.Users}" AS u ON "userOwnerId" = u.id 
                  WHERE status = 'Like' AND "postId" = p.id AND u."userIsBanned" = false
                  ORDER BY "addedAt" DESC LIMIT 3) AS r AS "newestLikes")
                  FROM "${TablesNames.Posts}" AS p
                  FULL JOIN "${TablesNames.Blogs}" AS b ON p."blogId" = b.id
                  FULL JOIN "${TablesNames.ExtendedLikesPostInfo}" AS l ON p.id = l."postId"
                  WHERE p."blogId" = $2 AND b."blogIsBanned" = false
                  GROUP BY p.id, p."blogId", p."blogName", p."title", p."shortDescription", p."content", p."createdAt"
                  ORDER BY "${queryAll.sortBy}" ${queryAll.sortDirection}
                  LIMIT $3 OFFSET $4`;

    const values = [
      userID === 'quest' ? blogID : userID,
      blogID,
      queryAll.pageSize,
      this.skippedObject(queryAll.pageNumber, queryAll.pageSize),
    ];

    const rawAllCommentToPost = await this.dataSource.query(text, values);

    console.log(rawAllCommentToPost);

    /*const mappedRawAllCommentToPost: GetCommentType[] =
      await rawAllCommentToPost.map((field) => {
        return {
          id: field.id,
          content: field.content,
          commentatorInfo: {
            userId: field.userOwnerId,
            userLogin: field.userOwnerLogin,
          },
          createdAt: field.createdAt,
          likesInfo: {
            likesCount: +field.likesCount,
            dislikesCount: +field.dislikesCount,
            myStatus: field.status === null ? MyLikeStatus.None : field.status,
          },
        };
      });

    const allCount: number =
      rawAllCommentToPost.length > 0 ? +rawAllCommentToPost[0].allCount : 0;

    const pagesCount: number = Math.ceil(allCount / queryAll.pageSize);

    return {
      pagesCount: pagesCount,
      page: queryAll.pageNumber,
      pageSize: queryAll.pageSize,
      totalCount: allCount,
      items: mappedRawAllCommentToPost,
    };

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
    };*/

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
    const text1 = `SELECT * FROM "${TablesNames.Posts}" WHERE id = $1`;

    const values1 = [postID];

    const rawPost = await this.dataSource.query(text1, values1);

    if (rawPost.length < 1) {
      throw new NotFoundException('post not found');
    }

    const text = `SELECT c.*,
                  (SELECT COUNT(*) AS "likesCount" FROM "${TablesNames.ExtendedLikesCommentInfo}" 
                  WHERE status = 'Like' AND "commentId" = c.id),
                  (SELECT COUNT(*)  AS "dislikesCount" FROM "${TablesNames.ExtendedLikesCommentInfo}" 
                  WHERE status = 'Dislike' AND "commentId" = c.id),
                  (SELECT status FROM "${TablesNames.ExtendedLikesCommentInfo}" 
                  WHERE "userOwnerId" = $1 AND "commentId" = c.id),
                  (SELECT COUNT(*) as "allCount" FROM "${TablesNames.Comments}" 
                  FULL JOIN "${TablesNames.Users}" AS u ON "userOwnerId" = u.id 
                  WHERE "postId" = $2 AND u."userIsBanned" = false)
                  FROM "${TablesNames.Comments}" AS c
                  FULL JOIN "${TablesNames.Users}" AS u ON c."userOwnerId" = u.id
                  FULL JOIN "${TablesNames.ExtendedLikesCommentInfo}" AS l ON c.id = l."commentId"
                  WHERE c."postId" = $2 AND u."userIsBanned" = false
                  GROUP BY c.id, c."userOwnerId", c."userOwnerLogin", c."postId", c."content", c."createdAt"
                  ORDER BY "${queryAll.sortBy}" ${queryAll.sortDirection}
                  LIMIT $3 OFFSET $4`;

    const values = [
      userID === 'quest' ? postID : userID,
      postID,
      queryAll.pageSize,
      this.skippedObject(queryAll.pageNumber, queryAll.pageSize),
    ];

    const rawAllCommentToPost = await this.dataSource.query(text, values);

    const mappedRawAllCommentToPost: GetCommentType[] =
      await rawAllCommentToPost.map((field) => {
        return {
          id: field.id,
          content: field.content,
          commentatorInfo: {
            userId: field.userOwnerId,
            userLogin: field.userOwnerLogin,
          },
          createdAt: field.createdAt,
          likesInfo: {
            likesCount: +field.likesCount,
            dislikesCount: +field.dislikesCount,
            myStatus: field.status === null ? MyLikeStatus.None : field.status,
          },
        };
      });

    const allCount: number =
      rawAllCommentToPost.length > 0 ? +rawAllCommentToPost[0].allCount : 0;

    const pagesCount: number = Math.ceil(allCount / queryAll.pageSize);

    return {
      pagesCount: pagesCount,
      page: queryAll.pageNumber,
      pageSize: queryAll.pageSize,
      totalCount: allCount,
      items: mappedRawAllCommentToPost,
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
