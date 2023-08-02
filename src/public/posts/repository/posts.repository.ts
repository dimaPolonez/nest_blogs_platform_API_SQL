import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CommentModelType,
  PostModel,
  PostModelType,
} from '../../../core/entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  ExtendedLikesPostInfoType,
  MyLikeStatus,
  PostsTableType,
  TablesNames,
} from '../../../core/models';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectModel(PostModel.name)
    private readonly PostModel: Model<PostModelType>,
  ) {}

  async findLikesToPost(
    postID: string,
    userID: string,
  ): Promise<ExtendedLikesPostInfoType[]> {
    const text = `SELECT * FROM "${TablesNames.ExtendedLikesPostInfo}" 
                  WHERE "postId" = $1 AND "userOwnerId" = $2`;

    const values = [postID, userID];

    return await this.dataSource.query(text, values);
  }

  async findRawPostById(postID: string): Promise<PostsTableType[]> {
    const text = `SELECT * FROM "${TablesNames.Posts}" 
                  WHERE "id" = $1`;

    const values = [postID];

    return await this.dataSource.query(text, values);
  }

  async addNewLikeToPost(
    userID: string,
    login: string,
    postID: string,
    likeStatus: MyLikeStatus,
  ) {
    const text = `INSERT INTO "${TablesNames.ExtendedLikesPostInfo}"
                  ("userOwnerId", "userOwnerLogin","postId", "status") 
                  VALUES($1, $2, $3, $4)`;

    const values = [userID, login, postID, likeStatus];

    await this.dataSource.query(text, values);
  }

  async deleteLikeToPost(userID: string, postID: string) {
    const text = `DELETE FROM "${TablesNames.ExtendedLikesPostInfo}" 
                  WHERE "userOwnerId" = $1 AND "postId" = $2`;

    const values = [userID, postID];

    await this.dataSource.query(text, values);
  }

  async updateLikeToPost(
    userID: string,
    postID: string,
    likeStatus: MyLikeStatus,
  ) {
    const text = `UPDATE "${TablesNames.ExtendedLikesPostInfo}" SET "status" = $1 
                  WHERE "userOwnerId" = $2 AND "postId" = $3`;

    const values = [likeStatus, userID, postID];

    await this.dataSource.query(text, values);
  }

  async findPostById(postID: string): Promise<PostModelType | null> {
    return this.PostModel.findById({ _id: postID });
  }

  async save(model: PostModelType | CommentModelType) {
    return await model.save();
  }
}
