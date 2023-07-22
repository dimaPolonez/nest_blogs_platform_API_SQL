import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BlogModel,
  BlogModelType,
  CommentModel,
  CommentModelType,
  PostModel,
  PostModelType,
  UserModel,
  UserModelType,
} from '../../../core/entity';
import {
  UpdateArrayCommentsType,
  UpdateArrayPostsType,
} from '../../../core/models';

@Injectable()
export class SuperAdminRepository {
  constructor(
    @InjectModel(BlogModel.name)
    private readonly BlogModel: Model<BlogModelType>,
    @InjectModel(PostModel.name)
    private readonly PostModel: Model<PostModelType>,
    @InjectModel(CommentModel.name)
    private readonly CommentModel: Model<CommentModelType>,
    @InjectModel(UserModel.name)
    private readonly UserModel: Model<UserModelType>,
  ) {}

  async banedActivityUser(isBanned: boolean, userID: string) {
    await this.CommentModel.updateMany(
      {
        'commentatorInfo.userId': userID,
      },
      { $set: { 'commentatorInfo.isBanned': isBanned } },
    );

    if (isBanned === true) {
      await this.UserModel.updateOne({ _id: userID }, { sessionsUser: [] });
    }
  }

  async banedBlog(isBanned: boolean, blogID: string) {
    let banDate = null;
    if (isBanned === true) {
      banDate = new Date().toISOString();
    }
    await this.BlogModel.updateMany(
      { _id: blogID },
      {
        $set: {
          'banInfo.isBanned': isBanned,
          'banInfo.banDate': banDate,
        },
      },
    );

    await this.PostModel.updateMany(
      { blogId: blogID },
      { $set: { blogIsBanned: isBanned } },
    );
  }

  async updateAllPostsIsBanned(isBanned: boolean, userID: string) {
    await this.PostModel.updateMany(
      { 'extendedLikesInfo.newestLikes.userId': userID },
      { $set: { 'extendedLikesInfo.newestLikes.$.isBanned': isBanned } },
    );

    return this.PostModel.find({});
  }

  async updateAllCommentIsBanned(isBanned: boolean, userID: string) {
    await this.CommentModel.updateMany(
      { 'likesInfo.newestLikes.userId': userID },
      { $set: { 'likesInfo.newestLikes.$.isBanned': isBanned } },
    );

    return this.CommentModel.find({});
  }

  async updateAllPostsCounterLikes(updateArrayPosts: UpdateArrayPostsType[]) {
    if (updateArrayPosts.length > 0) {
      for (let i = 0; i < updateArrayPosts.length; i++) {
        await this.PostModel.updateMany(
          { _id: updateArrayPosts[i].postID },
          {
            $set: {
              'extendedLikesInfo.likesCount': updateArrayPosts[i].likesCount,
              'extendedLikesInfo.dislikesCount':
                updateArrayPosts[i].dislikesCount,
            },
          },
        );
      }
    }
  }

  async updateAllCommentsCounterLikes(
    updateArrayComments: UpdateArrayCommentsType[],
  ) {
    if (updateArrayComments.length > 0) {
      for (let i = 0; i < updateArrayComments.length; i++) {
        await this.CommentModel.updateMany(
          { _id: updateArrayComments[i].commentID },
          {
            $set: {
              'likesInfo.likesCount': updateArrayComments[i].likesCount,
              'likesInfo.dislikesCount': updateArrayComments[i].dislikesCount,
            },
          },
        );
      }
    }
  }

  async findBlogById(blogID: string): Promise<BlogModelType | null> {
    return this.BlogModel.findById({ _id: blogID });
  }

  async findUserById(userID: string): Promise<UserModelType | null> {
    return this.UserModel.findById({ _id: userID });
  }

  async deleteUser(userID: string) {
    await this.UserModel.deleteOne({ _id: userID });
  }

  async save(model: BlogModelType | PostModelType | UserModelType) {
    return await model.save();
  }

  async deleteAllCollections() {
    await this.BlogModel.deleteMany();
    await this.PostModel.deleteMany();
    await this.CommentModel.deleteMany();
    await this.UserModel.deleteMany();
  }
}
