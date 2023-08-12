import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  BanUserOfBlogType,
  BlogsTableType,
  CreateBlogType,
  CreatePostOfBlogType,
  PostsTableType,
  TablesNames,
  UpdateBlogType,
  UpdatePostOfBlogType,
  UsersTableType,
} from '../../../core/models';

@Injectable()
export class BloggerRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
  ) {}

  async createBlog(
    blogDTO: CreateBlogType,
    userID: string,
    userLogin: string,
  ): Promise<BlogsTableType[]> {
    const text = `INSERT INTO "${TablesNames.Blogs}"("name", "description",
                  "websiteUrl", "userOwnerId", "userOwnerLogin") VALUES($1, $2, $3, $4, $5) RETURNING *`;
    const values = [
      blogDTO.name,
      blogDTO.description,
      blogDTO.websiteUrl,
      userID,
      userLogin,
    ];

    return await this.dataSource.query(text, values);
  }

  async findRawBlog(blogID: string): Promise<BlogsTableType[]> {
    const text = `SELECT * FROM "${TablesNames.Blogs}" WHERE "id" = $1`;

    const values = [blogID];

    return await this.dataSource.query(text, values);
  }

  async findRawUser(userID: string): Promise<UsersTableType[]> {
    const text = `SELECT * FROM "${TablesNames.Users}" WHERE "id" = $1`;

    const values = [userID];

    return await this.dataSource.query(text, values);
  }

  async updateRawBlog(blogID: string, blogDTO: UpdateBlogType) {
    const text = `UPDATE "${TablesNames.Blogs}" SET "name" = $1,
                  "description" = $2, "websiteUrl" = $3 WHERE "id" = $4`;

    const values = [
      blogDTO.name,
      blogDTO.description,
      blogDTO.websiteUrl,
      blogID,
    ];

    await this.dataSource.query(text, values);
  }

  async addBanUserToBlog(
    banUserOfBlogDTO: BanUserOfBlogType,
    userID: string,
    userLogin: string,
  ) {
    const text = `INSERT INTO "${TablesNames.BanAllUsersOfBlogInfo}"
                    ("blogId", "userId","userLogin","banReason") 
                    VALUES($1, $2, $3, $4)`;
    const values = [
      banUserOfBlogDTO.blogId,
      userID,
      userLogin,
      banUserOfBlogDTO.banReason,
    ];

    await this.dataSource.query(text, values);
  }

  async deleteBanUserToBlog(blogID: string, userID: string) {
    const text = `DELETE FROM "${TablesNames.BanAllUsersOfBlogInfo}" 
                  WHERE "blogId" = $1 AND "userId" = $2`;

    const values = [blogID, userID];

    await this.dataSource.query(text, values);
  }

  async deleteRawBlog(blogID: string) {
    const text = `DELETE FROM "${TablesNames.Blogs}" WHERE "id" = $1`;

    const values = [blogID];

    await this.dataSource.query(text, values);
  }

  async createPostOfBlog(
    postDTO: CreatePostOfBlogType,
    blogID: string,
    blogName: string,
  ): Promise<PostsTableType[]> {
    const text = `INSERT INTO "${TablesNames.Posts}"("blogId", "blogName",
                  "title", "shortDescription", "content") VALUES($1, $2, $3, $4, $5) RETURNING *`;
    const values = [
      blogID,
      blogName,
      postDTO.title,
      postDTO.shortDescription,
      postDTO.content,
    ];

    return await this.dataSource.query(text, values);
  }

  async updateRawPostOfBlog(
    postID: string,
    postDTO: UpdatePostOfBlogType,
  ): Promise<number> {
    const text = `UPDATE "${TablesNames.Posts}" SET "title" = $1,
                  "shortDescription" = $2, "content" = $3 WHERE "id" = $4`;

    const values = [
      postDTO.title,
      postDTO.shortDescription,
      postDTO.content,
      postID,
    ];

    const result = await this.dataSource.query(text, values);

    return result[1];
  }

  async deleteRawPostOfBlog(postID: string): Promise<number> {
    const text = `DELETE FROM "${TablesNames.Posts}" WHERE "id" = $1`;

    const values = [postID];

    const result = await this.dataSource.query(text, values);

    return result[1];
  }
}
