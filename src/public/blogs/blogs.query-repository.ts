import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BlogsTableType,
  GetAllBlogsType,
  GetAllPostsType,
  GetBlogType,
  GetPostType,
  MyLikeStatus,
  QueryBlogType,
  QueryPostType,
  TablesNames,
} from '../../core/models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
  ) {}

  skippedObject(pageNum: number, pageSize: number) {
    return (pageNum - 1) * pageSize;
  }

  async getAllPostsToBlog(
    userID: string,
    queryAll: QueryPostType,
    blogID: string,
  ): Promise<GetAllPostsType> {
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
  async findBlogById(blogID: string): Promise<GetBlogType> {
    const text = `SELECT * FROM "${TablesNames.Blogs}" WHERE "id" = $1`;

    const values = [blogID];

    const rawBlog: BlogsTableType[] = await this.dataSource.query(text, values);

    if (rawBlog.length < 1 || rawBlog[0].blogIsBanned === true) {
      throw new NotFoundException();
    }

    return {
      id: rawBlog[0].id,
      name: rawBlog[0].name,
      description: rawBlog[0].description,
      websiteUrl: rawBlog[0].websiteUrl,
      createdAt: rawBlog[0].createdAt,
      isMembership: rawBlog[0].isMembership,
    };
  }

  async getAllBlogs(queryAll: QueryBlogType): Promise<GetAllBlogsType> {
    const text1 = `SELECT *,
                   (SELECT COUNT(*) as "allCount" FROM "${TablesNames.Blogs}" 
                   WHERE "blogIsBanned" = false 
                   AND ("name" ILIKE '%${queryAll.searchNameTerm}%'))
                   FROM "${TablesNames.Blogs}"
                   WHERE "blogIsBanned" = false 
                   AND ("name" ILIKE '%${queryAll.searchNameTerm}%')
                   ORDER BY "${queryAll.sortBy}" ${queryAll.sortDirection}
                   LIMIT $1 OFFSET $2`;
    const values1 = [
      queryAll.pageSize,
      this.skippedObject(queryAll.pageNumber, queryAll.pageSize),
    ];

    const rawAllBlogs = await this.dataSource.query(text1, values1);

    const allMapsBlogs: GetBlogType[] = rawAllBlogs.map((field) => {
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
      items: allMapsBlogs,
    };
  }
}
