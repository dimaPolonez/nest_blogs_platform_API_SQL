import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentModel, CommentModelType } from '../../../core/entity';
import {
  CommentsTableType,
  ExtendedLikesCommentInfoType,
  ExtendedLikesPostInfoType,
  MyLikeStatus,
  TablesNames,
} from '../../../core/models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectModel(CommentModel.name)
    private readonly CommentModel: Model<CommentModelType>,
  ) {}

  async findLikesToComment(
    commentID: string,
    userID: string,
  ): Promise<ExtendedLikesCommentInfoType[]> {
    const text = `SELECT * FROM "${TablesNames.ExtendedLikesCommentInfo}" 
                  WHERE "commentId" = $1 AND "userOwnerId" = $2`;

    const values = [commentID, userID];

    return await this.dataSource.query(text, values);
  }

  async addNewLikeToComment(
    userID: string,
    login: string,
    commentID: string,
    likeStatus: MyLikeStatus,
  ) {
    const text = `INSERT INTO "${TablesNames.ExtendedLikesCommentInfo}"
                  ("userOwnerId", "userOwnerLogin","commentId", "status") 
                  VALUES($1, $2, $3, $4)`;

    const values = [userID, login, commentID, likeStatus];

    await this.dataSource.query(text, values);
  }

  async deleteLikeToComment(userID: string, commentID: string) {
    const text = `DELETE FROM "${TablesNames.ExtendedLikesCommentInfo}" 
                  WHERE "userOwnerId" = $1 AND "commentId" = $2`;

    const values = [userID, commentID];

    await this.dataSource.query(text, values);
  }

  async updateLikeToComment(
    userID: string,
    commentID: string,
    likeStatus: MyLikeStatus,
  ) {
    const text = `UPDATE "${TablesNames.ExtendedLikesCommentInfo}" SET "status" = $1 
                  WHERE "userOwnerId" = $2 AND "commentId" = $3`;

    const values = [likeStatus, userID, commentID];

    await this.dataSource.query(text, values);
  }

  async findRawCommentById(commentID: string): Promise<CommentsTableType[]> {
    const text = `SELECT * FROM "${TablesNames.Comments}" 
                  WHERE "id" = $1`;

    const values = [commentID];

    return await this.dataSource.query(text, values);
  }

  async updateRawCommentById(commentID: string, content: string) {
    const text = `UPDATE "${TablesNames.Comments}" SET "content" = $1 
                  WHERE id = $2`;

    const values = [content, commentID];

    await this.dataSource.query(text, values);
  }

  async deleteRawCommentById(commentID: string) {
    const text = `DELETE FROM "${TablesNames.Comments}" WHERE id = $1`;

    const values = [commentID];

    await this.dataSource.query(text, values);
  }

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
