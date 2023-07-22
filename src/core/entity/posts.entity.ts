import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MyLikeStatus, NewestLikesType, UpdatePostType } from '../models';

export type PostModelType = HydratedDocument<PostModel>;

@Schema()
export class ExtendedLikesInfo {
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
export class PostModel {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ default: false })
  blogIsBanned: boolean;

  @Prop({
    default: () => {
      return new Date().toISOString();
    },
  })
  createdAt: string;

  @Prop({ default: () => ({}) })
  extendedLikesInfo: ExtendedLikesInfo;

  updatePost(postDTO: UpdatePostType) {
    this.title = postDTO.title;
    this.shortDescription = postDTO.shortDescription;
    this.content = postDTO.content;
    this.blogId = postDTO.blogId;
    this.blogName = postDTO.blogName;
  }
}

export const PostModelSchema = SchemaFactory.createForClass(PostModel);

PostModelSchema.methods = {
  updatePost: PostModel.prototype.updatePost,
};
