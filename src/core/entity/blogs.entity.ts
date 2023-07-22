import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AllBanUsersInfoType, BindBlogType, UpdateBlogType } from '../models';

export type BlogModelType = HydratedDocument<BlogModel>;

@Schema()
export class BlogOwnerInfo {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;
}

@Schema()
class BanInfo {
  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ default: null })
  banDate: string;
}

@Schema()
export class BlogModel {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({
    default: () => {
      return new Date().toISOString();
    },
  })
  createdAt: string;

  @Prop({ default: false })
  isMembership: boolean;

  @Prop({ default: () => ({}) })
  blogOwnerInfo: BlogOwnerInfo;

  @Prop({ default: () => ({}) })
  banInfo: BanInfo;

  @Prop({ default: () => [] })
  banAllUsersInfo: AllBanUsersInfoType[];

  async updateBlog(blogDTO: UpdateBlogType) {
    this.name = blogDTO.name;
    this.description = blogDTO.description;
    this.websiteUrl = blogDTO.websiteUrl;
  }
  async bindBlog(blogDTO: BindBlogType) {
    this.blogOwnerInfo.userId = blogDTO.userId;
    this.blogOwnerInfo.userLogin = blogDTO.userLogin;
  }
}

export const BlogModelSchema = SchemaFactory.createForClass(BlogModel);

BlogModelSchema.methods = {
  updateBlog: BlogModel.prototype.updateBlog,
  bindBlog: BlogModel.prototype.bindBlog,
};
