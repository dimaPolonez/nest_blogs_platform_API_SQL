import { Injectable, NotFoundException } from '@nestjs/common';
import {
  GetCommentType,
  MyLikeStatus,
  TablesNames,
} from '../../../core/models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
  ) {}

  async findCommentById(
    commentID: string,
    userID?: string,
  ): Promise<GetCommentType> {
    const text = `SELECT c.*,
                  (SELECT COUNT(*) AS "likesCount" FROM "${TablesNames.ExtendedLikesCommentInfo}"
                  FULL JOIN "${TablesNames.Users}" AS u ON "userOwnerId" = u.id
                  WHERE status = 'Like' AND "commentId" = c.id AND u."userIsBanned" = false),
                  (SELECT COUNT(*)  AS "dislikesCount" FROM "${TablesNames.ExtendedLikesCommentInfo}"
                  FULL JOIN "${TablesNames.Users}" AS u ON "userOwnerId" = u.id 
                  WHERE status = 'Dislike' AND "commentId" = c.id AND u."userIsBanned" = false),
                  (SELECT status FROM "${TablesNames.ExtendedLikesCommentInfo}" 
                  WHERE "userOwnerId" = $1 AND "commentId" = c.id)
                  FROM "${TablesNames.Comments}" AS c
                  FULL JOIN "${TablesNames.Users}" AS u ON c."userOwnerId" = u.id
                  WHERE c.id = $2 AND u."userIsBanned" = false
                  GROUP BY c.id, c."userOwnerId", c."userOwnerLogin", c."postId", 
                  c."content", c."createdAt"`;

    const values = [userID === 'quest' ? commentID : userID, commentID];

    const rawComment = await this.dataSource.query(text, values);

    if (rawComment.length < 1) {
      throw new NotFoundException('comment not found');
    }

    return {
      id: rawComment[0].id,
      content: rawComment[0].content,
      commentatorInfo: {
        userId: rawComment[0].userOwnerId,
        userLogin: rawComment[0].userOwnerLogin,
      },
      createdAt: rawComment[0].createdAt,
      likesInfo: {
        likesCount: +rawComment[0].likesCount,
        dislikesCount: +rawComment[0].dislikesCount,
        myStatus:
          rawComment[0].status === null
            ? MyLikeStatus.None
            : rawComment[0].status,
      },
    };
  }
}
