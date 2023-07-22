import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MyLikeStatus, NewestLikesType, UpdateCommentType } from '../models';

export type CommentModelType = HydratedDocument<CommentModel>;

@Schema()
export class LikesInfo {
  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  dislikesCount: number;

  @Prop({ enum: MyLikeStatus, default: MyLikeStatus.None })
  myStatus: MyLikeStatus;

  @Prop({ required: true })
  newestLikes: NewestLikesType[];
}

@Schema()
export class CommentatorInfo {
  @Prop({ default: 'none' })
  userId: string;

  @Prop({ default: 'none' })
  userLogin: string;
  @Prop({ default: false })
  isBanned: boolean;
}

@Schema()
export class CommentModel {
  @Prop({ required: true })
  content: string;

  @Prop({ default: () => ({}) })
  commentatorInfo: CommentatorInfo;

  @Prop({ required: true })
  postId: string;

  @Prop({
    default: () => {
      return new Date().toISOString();
    },
  })
  createdAt: string;

  @Prop({ default: () => ({}) })
  likesInfo: LikesInfo;

  updateComment(commentDTO: UpdateCommentType) {
    this.content = commentDTO.content;
  }
}

export const CommentModelSchema = SchemaFactory.createForClass(CommentModel);

CommentModelSchema.methods = {
  updateComment: CommentModel.prototype.updateComment,
};
