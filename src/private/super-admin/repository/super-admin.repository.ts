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
  BanUserType,
  BlogsTableType,
  NewUserDTOType,
  TablesNames,
  UpdateArrayCommentsType,
  UpdateArrayPostsType,
  UsersTableType,
} from '../../../core/models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SuperAdminRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectModel(BlogModel.name)
    private readonly BlogModel: Model<BlogModelType>,
    @InjectModel(PostModel.name)
    private readonly PostModel: Model<PostModelType>,
    @InjectModel(CommentModel.name)
    private readonly CommentModel: Model<CommentModelType>,
    @InjectModel(UserModel.name)
    private readonly UserModel: Model<UserModelType>,
  ) {}

  async checkedUser(userID: string): Promise<UsersTableType[]> {
    const text = `SELECT * FROM "${TablesNames.Users}" WHERE "id" = $1`;
    const values = [userID];

    return await this.dataSource.query(text, values);
  }

  async createUser(newUserDTO: NewUserDTOType): Promise<UsersTableType[]> {
    const text = `INSERT INTO "${TablesNames.Users}"(login, "hushPass", email) 
                  VALUES($1, $2, $3) RETURNING *`;
    const values = [newUserDTO.login, newUserDTO.hushPass, newUserDTO.email];

    return await this.dataSource.query(text, values);
  }
  async banedUser(banUserDTO: BanUserType, userID: string): Promise<number> {
    let text = '';
    let values = null;

    if (banUserDTO.isBanned === true) {
      text = `UPDATE "${TablesNames.Users}" SET "userIsBanned" = $1, 
                "banDate" = NOW(), "banReason" = $2 WHERE "id" = $3`;
      values = [banUserDTO.isBanned, banUserDTO.banReason, userID];
    }

    if (banUserDTO.isBanned === false) {
      text = `UPDATE "${TablesNames.Users}" SET "userIsBanned" = false, 
              "banDate" = null, "banReason" = null WHERE "id" = $1`;
      values = [userID];
    }

    const result = await this.dataSource.query(text, values);

    return result[1];
  }

  async bannedRawBlog(isBanned: boolean, blogID: string): Promise<number> {
    let text = '';
    let values = null;

    if (isBanned === true) {
      text = `UPDATE "${TablesNames.Blogs}" SET "blogIsBanned" = true, 
                "banDate" = NOW() WHERE "id" = $1`;
      values = [blogID];
    }

    if (isBanned === false) {
      text = `UPDATE "${TablesNames.Blogs}" SET "blogIsBanned" = false, 
                "banDate" = null WHERE "id" = $1`;
      values = [blogID];
    }

    const result = await this.dataSource.query(text, values);

    return result[1];
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

  async findUserByIdSql(userID: string): Promise<UsersTableType[]> {
    const text = `SELECT * FROM "${TablesNames.Users}" WHERE "id" = $1`;
    const values = [userID];

    return await this.dataSource.query(text, values);
  }

  async findBlogByIdSql(blogID: string): Promise<BlogsTableType[]> {
    const text = `SELECT * FROM "${TablesNames.Blogs}" WHERE "id" = $1`;
    const values = [blogID];

    return await this.dataSource.query(text, values);
  }

  async bindBlogToUser(blogID: string, userID: string, userLogin: string) {
    const text = `UPDATE "${TablesNames.Blogs}" SET "userOwnerId" = $1, "userOwnerLogin" = $2 WHERE "id" = $3`;

    const values = [userID, userLogin, blogID];

    await this.dataSource.query(text, values);
  }

  async deleteUser(userID: string): Promise<number> {
    const text = `DELETE FROM "${TablesNames.Users}" WHERE "id" = $1`;
    const values = [userID];

    const result = await this.dataSource.query(text, values);

    return result[1];
  }

  async save(model: BlogModelType | PostModelType | UserModelType) {
    return await model.save();
  }

  async deleteAllCollections() {
    const tablesArray: TablesNames[] = [
      TablesNames.Users,
      TablesNames.Blogs,
      TablesNames.Posts,
      TablesNames.Comments,
      TablesNames.SessionsUsersInfo,
      TablesNames.BanAllUsersOfBlogInfo,
      TablesNames.ExtendedLikesPostInfo,
      TablesNames.ExtendedLikesCommentInfo,
    ];

    await tablesArray.forEach((nameTable) => {
      const text = `DELETE FROM "${nameTable}"`;

      this.dataSource.query(text);
    });
  }
}
