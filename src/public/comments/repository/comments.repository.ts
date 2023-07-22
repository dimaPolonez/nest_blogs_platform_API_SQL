import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentModel, CommentModelType } from '../../../core/entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(CommentModel.name)
    private readonly CommentModel: Model<CommentModelType>,
  ) {}

  async findCommentById(commentID: string): Promise<CommentModelType | null> {
    return this.CommentModel.findById({ _id: commentID });
  }

  async deleteComment(commentID: string) {
    await this.CommentModel.deleteOne({ _id: commentID });
  }

  async save(model: CommentModelType) {
    return await model.save();
  }
}
