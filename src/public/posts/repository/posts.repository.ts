import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  BanAllUsersOfBlogInfoType,
  CommentsTableType,
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

  async addNewCommentToPost(
    userID: string,
    login: string,
    postID: string,
    content: string,
  ): Promise<CommentsTableType[]> {
    const text = `INSERT INTO "${TablesNames.Comments}"
                  ("userOwnerId", "userOwnerLogin","postId", "content") 
                  VALUES($1, $2, $3, $4) RETURNING *`;

    const values = [userID, login, postID, content];

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

  async checkedBanUserToBlog(
    userID: string,
    blogID: string,
  ): Promise<BanAllUsersOfBlogInfoType[]> {
    const text = `SELECT * FROM "${TablesNames.BanAllUsersOfBlogInfo}" 
                  WHERE "blogId" = $1 AND "userId" = $2`;

    const values = [blogID, userID];

    return await this.dataSource.query(text, values);
  }
}
