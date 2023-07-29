import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BlogModel,
  BlogModelType,
  PostModel,
  PostModelType,
} from '../../../core/entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  BlogsTableType,
  CreateBlogType,
  TablesNames,
} from '../../../core/models';

@Injectable()
export class BloggerRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectModel(BlogModel.name)
    private readonly BlogModel: Model<BlogModelType>,
    @InjectModel(PostModel.name)
    private readonly PostModel: Model<PostModelType>,
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

  async findBlogById(blogID: string): Promise<BlogModelType | null> {
    return this.BlogModel.findById({ _id: blogID });
  }

  async findPostById(postID: string): Promise<PostModelType | null> {
    return this.PostModel.findById({ _id: postID });
  }

  async deleteBlog(blogID: string) {
    await this.BlogModel.deleteOne({ _id: blogID });
  }

  async deletePost(postID: string) {
    await this.PostModel.deleteOne({ _id: postID });
  }

  async save(model: BlogModelType | PostModelType) {
    return await model.save();
  }
}
