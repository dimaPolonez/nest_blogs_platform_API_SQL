import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AllBanUsersInfoType,
  GetAllBlogsType,
  GetAllCommentOfPostType,
  GetAllCommentsToBloggerType,
  GetAllCommentsType,
  GetAllPostsType,
  getBanAllUserOfBlogType,
  GetBlogType,
  GetCommentType,
  GetPostType,
  MinimalBlog,
  MyLikeStatus,
  NewestLikesType,
  QueryBlogType,
  QueryCommentType,
  QueryPostType,
} from '../../../core/models';
import {
  BlogModel,
  BlogModelType,
  CommentModel,
  CommentModelType,
  PostModel,
  PostModelType,
} from '../../../core/entity';

@Injectable()
export class BloggerQueryRepository {
  constructor(
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
    const allBlogs: BlogModelType[] = await this.BlogModel.find({
      $and: [
        {
          'blogOwnerInfo.userId': blogerId,
          'banInfo.isBanned': false,
        },
        { name: new RegExp(queryAll.searchNameTerm, 'gi') },
      ],
    })
      .skip(this.skippedObject(queryAll.pageNumber, queryAll.pageSize))
      .limit(queryAll.pageSize)
      .sort({
        [queryAll.sortBy]: this.sortObject(queryAll.sortDirection),
      });

    const allMapsBlogs: GetBlogType[] = allBlogs.map((field) => {
      return {
        id: field.id,
        name: field.name,
        description: field.description,
        websiteUrl: field.websiteUrl,
        createdAt: field.createdAt,
        isMembership: field.isMembership,
      };
    });

    const allCount: number = await this.BlogModel.countDocuments({
      $and: [
        {
          'blogOwnerInfo.userId': blogerId,
          'banInfo.isBanned': false,
        },
        { name: new RegExp(queryAll.searchNameTerm, 'gi') },
      ],
    });
    const pagesCount: number = Math.ceil(allCount / queryAll.pageSize);

    return {
      pagesCount: pagesCount,
      page: queryAll.pageNumber,
      pageSize: queryAll.pageSize,
      totalCount: allCount,
      items: allMapsBlogs,
    };
  }

  async getAllPostsOfBlogToBlogger(
    userID: string,
    queryAll: QueryPostType,
    blogID: string,
    params?: string,
  ): Promise<GetAllPostsType> {
    const findBlogSmart: BlogModelType | null = await this.BlogModel.findById(
      blogID,
    );

    if (!findBlogSmart || findBlogSmart.banInfo.isBanned === true) {
      throw new NotFoundException();
    }

    if (findBlogSmart.blogOwnerInfo.userId !== userID) {
      throw new ForbiddenException('The user is not the owner of the blog');
    }

    const allPosts: PostModelType[] = await this.PostModel.find({
      blogId: blogID,
    })
      .skip(this.skippedObject(queryAll.pageNumber, queryAll.pageSize))
      .limit(queryAll.pageSize)
      .sort({ [queryAll.sortBy]: this.sortObject(queryAll.sortDirection) });

    const allMapsPosts: GetPostType[] = allPosts.map((field) => {
      let userStatus = MyLikeStatus.None;

      const findUserLike: null | NewestLikesType =
        field.extendedLikesInfo.newestLikes.find((v) => v.userId === userID);

      if (findUserLike) {
        userStatus = findUserLike.myStatus;
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

    const allCount: number = await this.PostModel.countDocuments({
      blogId: blogID,
    });
    const pagesCount: number = Math.ceil(allCount / queryAll.pageSize);

    return {
      pagesCount: pagesCount,
      page: queryAll.pageNumber,
      pageSize: queryAll.pageSize,
      totalCount: allCount,
      items: allMapsPosts,
    };
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
    const findBlogSmart: BlogModelType | null = await this.BlogModel.findById(
      blogID,
    );

    if (!findBlogSmart) {
      throw new NotFoundException();
    }

    if (findBlogSmart.blogOwnerInfo.userId !== userToken) {
      throw new ForbiddenException();
    }

    const banUserArraySearhLogin = findBlogSmart.banAllUsersInfo.filter(
      (v) =>
        new RegExp(queryAll.searchNameTerm, 'gi').test(v.login) &&
        v.banInfo.isBanned === true,
    );

    const skip = this.skippedObject(queryAll.pageNumber, queryAll.pageSize);
    const limit = queryAll.pageSize;
    const sortBy = queryAll.sortBy;
    const sortDirections = queryAll.sortDirection;

    banUserArraySearhLogin.sort(
      (a: AllBanUsersInfoType, b: AllBanUsersInfoType) => {
        if (a[sortBy] < b[sortBy]) {
          return sortDirections === 'asc' ? -1 : 1;
        }
        if (a[sortBy] > b[sortBy]) {
          return sortDirections === 'asc' ? 1 : -1;
        }
        return 0;
      },
    );

    const paginationBanUserArray = banUserArraySearhLogin.slice(
      skip,
      skip + limit,
    );

    const allCount: number = banUserArraySearhLogin.length;

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
