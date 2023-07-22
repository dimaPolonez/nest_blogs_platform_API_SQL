import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CommentModelType,
  PostModel,
  PostModelType,
} from '../../../core/entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(PostModel.name)
    private readonly PostModel: Model<PostModelType>,
  ) {}

  async findPostById(postID: string): Promise<PostModelType | null> {
    return this.PostModel.findById({ _id: postID });
  }

  async save(model: PostModelType | CommentModelType) {
    return await model.save();
  }
}
