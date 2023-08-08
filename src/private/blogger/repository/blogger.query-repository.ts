import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AllBanUsersInfoType,
  BanAllUsersOfBlogInfoType,
  BlogsTableType,
  ExtendedLikesPostInfoType,
  GetAllBlogsType,
  GetAllCommentOfPostType,
  GetAllCommentsToBloggerType,
  GetAllPostsOfBlogType,
  GetAllPostsToBloggerType,
  GetAllPostsType,
  getBanAllUserOfBlogType,
  GetBlogType,
  GetPostToBloggerType,
  GetPostType,
  MyLikeStatus,
  NewestLikesToBloggerType,
  NewestLikesType,
  PostsTableType,
  QueryBlogType,
  QueryCommentType,
  QueryPostType,
  TablesNames,
} from '../../../core/models';
import {
  BlogModel,
  BlogModelType,
  CommentModel,
  CommentModelType,
  PostModel,
  PostModelType,
} from '../../../core/entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BloggerQueryRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectModel(BlogModel.name)
    private readonly BlogModel: Model<BlogModelType>,
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
  async findBlogById(blogID: string): Promise<GetBlogType> {
    const findBlogSmart: BlogModelType | null = await this.BlogModel.findById(
      blogID,
    );

    if (!findBlogSmart) {
      throw new NotFoundException();
    }

    return {
      id: findBlogSmart.id,
      name: findBlogSmart.name,
      description: findBlogSmart.description,
      websiteUrl: findBlogSmart.websiteUrl,
      createdAt: findBlogSmart.createdAt,
      isMembership: findBlogSmart.isMembership,
    };
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
          (v) => v.myStatus === MyLikeStatus.Like,
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

  async getAllBlogsToBlogger(
    blogerId: string,
    queryAll: QueryBlogType,
  ): Promise<GetAllBlogsType> {
    const text1 = `SELECT *,
                   (SELECT COUNT(*) as "allCount" FROM "${TablesNames.Blogs}" 
                   WHERE "userOwnerId" = $1 AND "blogIsBanned" = false 
                   AND ("name" ILIKE '%${queryAll.searchNameTerm}%'))
                   FROM "${TablesNames.Blogs}"
                   WHERE "userOwnerId" = $1 AND "blogIsBanned" = false 
                   AND ("name" ILIKE '%${queryAll.searchNameTerm}%')
                   ORDER BY "${queryAll.sortBy}" ${queryAll.sortDirection}
                   LIMIT $2 OFFSET $3`;
    const values1 = [
      blogerId,
      queryAll.pageSize,
      this.skippedObject(queryAll.pageNumber, queryAll.pageSize),
    ];

    const rawAllBlogs = await this.dataSource.query(text1, values1);

    const mappedAllBlogs: GetBlogType[] = rawAllBlogs.map((field) => {
      return {
        id: field.id,
        name: field.name,
        description: field.description,
        websiteUrl: field.websiteUrl,
        createdAt: field.createdAt,
        isMembership: field.isMembership,
      };
    });

    const allCount: number =
      rawAllBlogs.length > 0 ? +rawAllBlogs[0].allCount : 0;

    const pagesCount: number = Math.ceil(allCount / queryAll.pageSize);

    return {
      pagesCount: pagesCount,
      page: queryAll.pageNumber,
      pageSize: queryAll.pageSize,
      totalCount: allCount,
      items: mappedAllBlogs,
    };
  }

  async getAllPostsOfBlogToBlogger(
    userID: string,
    queryAll: QueryPostType,
    blogID: string,
  ): Promise<GetAllPostsToBloggerType> {
    const text1 = `SELECT * FROM "${TablesNames.Blogs}" WHERE "id" = $1`;

    const values1 = [blogID];

    const rawBlog: BlogsTableType[] = await this.dataSource.query(
      text1,
      values1,
    );

    if (rawBlog.length < 1 || rawBlog[0].blogIsBanned === true) {
      throw new NotFoundException('blog not found');
    }

    if (rawBlog[0].userOwnerId !== userID) {
      throw new ForbiddenException('The user is not the owner of the blog');
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
                  (SELECT ARRAY_TO_JSON(ARRAY( SELECT ROW_TO_JSON(r) FROM (SELECT "addedAt", "userOwnerId" AS "userId", "userOwnerLogin" AS "login"
                  FROM "${TablesNames.ExtendedLikesPostInfo}"
                  FULL JOIN "${TablesNames.Users}" AS u ON "userOwnerId" = u.id 
                  WHERE status = 'Like' AND "postId" = p.id AND u."userIsBanned" = false
                  ORDER BY "addedAt" DESC LIMIT 3) AS r)) AS "newestLikes")
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

    const rawAllPostToBlog = await this.dataSource.query(text, values);

    const mappedRawAllPostToBlog: GetPostType[] = await rawAllPostToBlog.map(
      (field) => {
        return {
          id: field.id,
          title: field.title,
          shortDescription: field.shortDescription,
          content: field.content,
          blogId: field.blogId,
          blogName: field.blogName,
          createdAt: field.createdAt,
          extendedLikesInfo: {
            likesCount: +field.likesCount,
            dislikesCount: +field.dislikesCount,
            myStatus: field.status === null ? MyLikeStatus.None : field.status,
            newestLikes: field.newestLikes,
          },
        };
      },
    );
    const allCount: number =
      rawAllPostToBlog.length > 0 ? +rawAllPostToBlog[0].allCount : 0;

    const pagesCount: number = Math.ceil(allCount / queryAll.pageSize);

    return {
      pagesCount: pagesCount,
      page: queryAll.pageNumber,
      pageSize: queryAll.pageSize,
      totalCount: allCount,
      items: mappedRawAllPostToBlog,
    };
  }
  async getAllCommentsToBlogger(
    userID: string,
    queryAll: QueryCommentType,
  ): Promise<GetAllCommentsToBloggerType> {
    const text = `SELECT c.*,
                  (SELECT COUNT(*) AS "likesCount" FROM "${TablesNames.ExtendedLikesCommentInfo}" 
                  WHERE status = 'Like' AND "commentId" = c.id),
                  (SELECT COUNT(*)  AS "dislikesCount" FROM "${TablesNames.ExtendedLikesCommentInfo}" 
                  WHERE status = 'Dislike' AND "commentId" = c.id),
                  (SELECT COUNT(*) as "allCount" FROM "${TablesNames.Comments}" AS c
                  FULL JOIN "${TablesNames.Posts}" AS p ON c."postId" = p.id
                  FULL JOIN "${TablesNames.Blogs}" AS b ON p."blogId" = b.id
                  FULL JOIN "${TablesNames.Users}" AS u ON c."userOwnerId" = u.id
                  WHERE (b."userOwnerId" = $1 AND p."blogId" = b.id 
                  AND c."postId" = p.id) AND u."userIsBanned" = false),
                  p.title, p."blogId", p."blogName"
                  FROM "${TablesNames.Comments}" AS c
                  FULL JOIN "${TablesNames.Posts}" AS p ON c."postId" = p.id
                  FULL JOIN "${TablesNames.Blogs}" AS b ON p."blogId" = b.id
                  FULL JOIN "${TablesNames.Users}" AS u ON c."userOwnerId" = u.id
                  WHERE (b."userOwnerId" = $1 AND p."blogId" = b.id 
                  AND c."postId" = p.id) AND u."userIsBanned" = false
                  GROUP BY c.id, c."userOwnerId", c."userOwnerLogin", c."postId", 
                  c."content", c."createdAt", p.title, p."blogId", p."blogName"
                  ORDER BY "${queryAll.sortBy}" ${queryAll.sortDirection}
                  LIMIT $2 OFFSET $3`;

    const values = [
      userID,
      queryAll.pageSize,
      this.skippedObject(queryAll.pageNumber, queryAll.pageSize),
    ];

    const allCommentsToBlogger = await this.dataSource.query(text, values);

    const mappedAllCommentsToBlogger = await allCommentsToBlogger.map((v) => {
      return {
        id: v.id,
        content: v.content,
        commentatorInfo: {
          userId: v.userOwnerId,
          userLogin: v.userOwnerLogin,
        },
        createdAt: v.createdAt,
        likesInfo: {
          likesCount: +v.likesCount,
          dislikesCount: +v.dislikesCount,
          myStatus: MyLikeStatus.None,
        },
        postInfo: {
          id: v.postId,
          title: v.title,
          blogId: v.blogId,
          blogName: v.blogName,
        },
      };
    });

    const allCount: number =
      allCommentsToBlogger.length > 0 ? +allCommentsToBlogger[0].allCount : 0;

    const pagesCount: number = Math.ceil(allCount / queryAll.pageSize);

    return {
      pagesCount: pagesCount,
      page: queryAll.pageNumber,
      pageSize: queryAll.pageSize,
      totalCount: allCount,
      items: mappedAllCommentsToBlogger,
    };
  }

  async getBanAllUserOfBlog(
    userToken: string,
    blogID: string,
    queryAll: QueryBlogType,
  ): Promise<getBanAllUserOfBlogType> {
    const text1 = `SELECT * FROM "${TablesNames.Blogs}" WHERE "id" = $1`;

    const values1 = [blogID];

    const rawBlog: BlogsTableType[] = await this.dataSource.query(
      text1,
      values1,
    );

    if (rawBlog.length < 1 || rawBlog[0].blogIsBanned === true) {
      throw new NotFoundException('blog not found');
    }

    if (rawBlog[0].userOwnerId !== userToken) {
      throw new ForbiddenException('The user is not the owner of the blog');
    }

    const text2 = `SELECT *,
                   (SELECT COUNT(*) as "allCount" FROM "${
                     TablesNames.BanAllUsersOfBlogInfo
                   }"  
                   WHERE "blogId" = $1 AND 
                   "userLogin" ILIKE '%${queryAll.searchNameTerm}%')
                   FROM "${TablesNames.BanAllUsersOfBlogInfo}"
                   WHERE "blogId" = $1 AND 
                   "userLogin" ILIKE '%${queryAll.searchNameTerm}%'
                   ORDER BY "${
                     queryAll.sortBy === 'login' ? 'userLogin' : 'createdAt'
                   }" ${queryAll.sortDirection}
                   LIMIT $2 OFFSET $3`;

    const values2 = [
      blogID,
      queryAll.pageSize,
      this.skippedObject(queryAll.pageNumber, queryAll.pageSize),
    ];

    const rawAllBannedUserToBlog = await this.dataSource.query(text2, values2);

    const paginationBanUserArray: AllBanUsersInfoType[] =
      rawAllBannedUserToBlog.map((field) => {
        return {
          id: field.userId,
          login: field.userLogin,
          banInfo: {
            isBanned: true,
            banDate: field.banDate,
            banReason: field.banReason,
          },
        };
      });

    const allCount: number =
      rawAllBannedUserToBlog.length > 0
        ? +rawAllBannedUserToBlog[0].allCount
        : 0;

    const pagesCount: number = Math.ceil(allCount / queryAll.pageSize);

    return {
      pagesCount: pagesCount,
      page: queryAll.pageNumber,
      pageSize: queryAll.pageSize,
      totalCount: allCount,
      items: paginationBanUserArray,
    };
  }
}
