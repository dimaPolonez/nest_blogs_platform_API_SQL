import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BlogModel,
  BlogModelType,
  PostModel,
  PostModelType,
} from '../../../core/entity';

@Injectable()
export class BloggerRepository {
  constructor(
    @InjectModel(BlogModel.name)
    private readonly BlogModel: Model<BlogModelType>,
    @InjectModel(PostModel.name)
    private readonly PostModel: Model<PostModelType>,
  ) {}

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
