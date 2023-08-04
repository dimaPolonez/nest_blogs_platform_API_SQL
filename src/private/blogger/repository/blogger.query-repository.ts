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
    const text1 = `SELECT * FROM "${TablesNames.Blogs}"
                   WHERE "userOwnerId" = $1 AND "blogIsBanned" = false 
                   AND ("name" ILIKE '%${queryAll.searchNameTerm}%')
                   ORDER BY "${queryAll.sortBy}" ${queryAll.sortDirection}
                   LIMIT $2 OFFSET $3`;
    const values1 = [
      blogerId,
      queryAll.pageSize,
      this.skippedObject(queryAll.pageNumber, queryAll.pageSize),
    ];

    const rawAllBlogs: BlogsTableType[] = await this.dataSource.query(
      text1,
      values1,
    );

    const text2 = `SELECT * FROM "${TablesNames.Blogs}"
                   WHERE "userOwnerId" = $1 AND "blogIsBanned" = false 
                   AND ("name" ILIKE '%${queryAll.searchNameTerm}%')`;

    const values2 = [blogerId];

    const rawAllBlogsCount: BlogsTableType[] = await this.dataSource.query(
      text2,
      values2,
    );

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

    const allCount: number = rawAllBlogsCount.length;

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

    const text2 = `SELECT * FROM "${TablesNames.Posts}"
                       WHERE "blogId" = $1 
                       ORDER BY "${queryAll.sortBy}" ${queryAll.sortDirection}
                       LIMIT $2 OFFSET $3`;

    const values2 = [
      blogID,
      queryAll.pageSize,
      this.skippedObject(queryAll.pageNumber, queryAll.pageSize),
    ];

    const rawAllPosts: PostsTableType[] = await this.dataSource.query(
      text2,
      values2,
    );

    const text3 = `SELECT * FROM "${TablesNames.Posts}"
                       WHERE "blogId" = $1`;

    const values3 = [blogID];

    const rawAllPostsCount: PostsTableType[] = await this.dataSource.query(
      text3,
      values3,
    );

    const mappedAllPosts: GetPostToBloggerType[] = rawAllPosts.map((field) => {
      const userStatus = MyLikeStatus.None;
      const newestLikesArray: NewestLikesToBloggerType[] = [];
      const likesCount = 0;
      const dislikesCount = 0;
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
    });

    const allCount: number = rawAllPostsCount.length;

    const pagesCount: number = Math.ceil(allCount / queryAll.pageSize);

    return {
      pagesCount: pagesCount,
      page: queryAll.pageNumber,
      pageSize: queryAll.pageSize,
      totalCount: allCount,
      items: mappedAllPosts,
    };

    /*
        const text2 = `SELECT Posts.*, Likes.*, Users."userIsBanned"
                       FROM "${TablesNames.Posts}" AS Posts
                       FULL JOIN "${TablesNames.ExtendedLikesPostInfo}" AS Likes
                       ON Posts.id = Likes."postId"
                       FULL JOIN "${TablesNames.Users}" AS Users
                       ON Likes."userOwnerId" = Users.id
                       WHERE Posts."blogId" = $1
                       ORDER BY "${queryAll.sortBy}" ${queryAll.sortDirection}
                       LIMIT $2 OFFSET $3`;

        const values2 = [
          blogID,
          queryAll.pageSize,
          this.skippedObject(queryAll.pageNumber, queryAll.pageSize),
        ];

        const rawAllPosts = await this.dataSource.query(text2, values2);

        const mappedAllPosts: Promise<GetPostToBloggerType>[] = rawAllPosts.map(
          async (field) => {
            let userStatus = MyLikeStatus.None;

            const text4 = `SELECT likes.*
                         FROM "${TablesNames.ExtendedLikesPostInfo}" AS likes
                         JOIN "${TablesNames.Users}" AS users
                         ON likes.userOwnerId = users.id
                         WHERE likes.postId = $1 AND users.userIsBanned = false`;

            const values4 = [field.id];

            const likesArrayToPost: ExtendedLikesPostInfoType[] =
              await this.dataSource.query(text4, values4);

            let newestLikesArray: NewestLikesToBloggerType[] = [];

            let likesCount = 0;
            let dislikesCount = 0;

            if (likesArrayToPost.length > 0) {
              const findUserLike: ExtendedLikesPostInfoType = likesArrayToPost.find(
                (v) => v.userOwnerId === userID,
              );

              if (findUserLike) {
                userStatus = findUserLike.status;
              }
              newestLikesArray = likesArrayToPost
                .map((v) => {
                  if (v.status === MyLikeStatus.Like) {
                    likesCount++;
                    return {
                      addedAt: v.addedAt,
                      userId: v.userOwnerId,
                      login: v.userOwnerLogin,
                    };
                  }
                })
                .sort((a, b) =>
                  a.addedAt < b.addedAt ? 1 : a.addedAt > b.addedAt ? -1 : 0,
                )
                .slice(0, 3);

              dislikesCount = likesArrayToPost.length - likesCount;
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
                likesCount: likesCount,
                dislikesCount: dislikesCount,
                myStatus: userStatus,
                newestLikes: newestLikesArray,
              },
            };
          },
        );

        */
  }
  async getAllCommentsToBlogger(
    userID: string,
    queryAll: QueryCommentType,
  ): Promise<GetAllCommentsToBloggerType> {
    const allBlogs: BlogModelType[] = await this.BlogModel.find({
      'blogOwnerInfo.userId': userID,
    });

    const blogIdArray = [];

    allBlogs.map((v) => blogIdArray.push(v.id));

    const allPostsArray = [];

    if (blogIdArray) {
      for (let i = 0; i < blogIdArray.length; i++) {
        const allPostsOfBlog: PostModelType[] = await this.PostModel.find({
          blogId: blogIdArray[i],
        });

        allPostsOfBlog.map((v) =>
          allPostsArray.push({
            blogId: v.blogId,
            blogName: v.blogName,
            title: v.title,
            id: v.id,
          }),
        );
      }
    }

    const fullCommentsToBlogger = [];

    if (allPostsArray) {
      for (let i = 0; i < allPostsArray.length; i++) {
        const allComments: CommentModelType[] = await this.CommentModel.find({
          $and: [
            { postId: allPostsArray[i].id },
            { 'commentatorInfo.isBanned': false },
          ],
        });

        allComments.map((v: CommentModelType) => {
          let userStatus = MyLikeStatus.None;

          const findUserLike: null | NewestLikesType =
            v.likesInfo.newestLikes.find((v) => v.userId === userID);

          if (findUserLike) {
            userStatus = findUserLike.myStatus;
          }

          fullCommentsToBlogger.push({
            id: v.id,
            content: v.content,
            createdAt: v.createdAt,
            commentatorInfo: {
              userId: v.commentatorInfo.userId,
              userLogin: v.commentatorInfo.userLogin,
            },
            likesInfo: {
              likesCount: v.likesInfo.likesCount,
              dislikesCount: v.likesInfo.dislikesCount,
              myStatus: userStatus,
            },
            postInfo: allPostsArray[i],
          });
        });
      }
    }

    const skip = this.skippedObject(queryAll.pageNumber, queryAll.pageSize);
    const limit = queryAll.pageSize;
    const sortBy = queryAll.sortBy;
    const sortDirections = queryAll.sortDirection;

    fullCommentsToBlogger.sort(
      (a: GetAllCommentOfPostType, b: GetAllCommentOfPostType) => {
        if (a[sortBy] < b[sortBy]) {
          return sortDirections === 'asc' ? -1 : 1;
        }
        if (a[sortBy] > b[sortBy]) {
          return sortDirections === 'asc' ? 1 : -1;
        }
        return 0;
      },
    );

    const paginationFullCommentsToBlogger = fullCommentsToBlogger.slice(
      skip,
      skip + limit,
    );

    const allCount: number = fullCommentsToBlogger.length;

    const pagesCount: number = Math.ceil(allCount / queryAll.pageSize);

    return {
      pagesCount: pagesCount,
      page: queryAll.pageNumber,
      pageSize: queryAll.pageSize,
      totalCount: allCount,
      items: paginationFullCommentsToBlogger,
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

    const text2 = `SELECT * FROM "${TablesNames.BanAllUsersOfBlogInfo}"
                   WHERE "blogId" = $1 AND 
                   "userLogin" ILIKE '%${queryAll.searchNameTerm}%'
                   ORDER BY "${queryAll.sortBy}" ${queryAll.sortDirection}
                   LIMIT $2 OFFSET $3`;

    const values2 = [
      blogID,
      queryAll.pageSize,
      this.skippedObject(queryAll.pageNumber, queryAll.pageSize),
    ];

    const rawAllBannedUserToBlog: BanAllUsersOfBlogInfoType[] =
      await this.dataSource.query(text2, values2);

    const text3 = `SELECT * FROM "${TablesNames.BanAllUsersOfBlogInfo}"
                   WHERE "blogId" = $1 AND 
                   "userLogin" ILIKE '%${queryAll.searchNameTerm}%'`;

    const values3 = [blogID];

    const rawAllUsersBannedCount: BanAllUsersOfBlogInfoType[] =
      await this.dataSource.query(text3, values3);

    const paginationBanUserArray: AllBanUsersInfoType[] =
      rawAllBannedUserToBlog.map((field) => {
        return {
          id: field.id,
          login: field.userLogin,
          banInfo: {
            isBanned: true,
            banDate: field.banDate,
            banReason: field.banReason,
          },
        };
      });

    const allCount: number = rawAllUsersBannedCount.length;

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
