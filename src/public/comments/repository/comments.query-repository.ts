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
    const text = `SELECT comment.*
                  FROM "${TablesNames.Comments}" AS comment
                  FULL JOIN "${TablesNames.Users}" AS user_owner
                  ON comment."userOwnerId" = user_owner.id
                  WHERE comment.id = $1 AND user_owner."userIsBanned" = false`;

    const values = [commentID];

    const rawComment = await this.dataSource.query(text, values);

    if (rawComment.length < 1 || rawComment[0].userIsBanned === true) {
      throw new NotFoundException('comment not found');
    }

    let userStatus = MyLikeStatus.None;

    const text1 = `SELECT like_comment.*,
                  (SELECT COUNT(*) AS "likesCount" FROM "${TablesNames.ExtendedLikesCommentInfo}" WHERE status = 'Like' AND "commentId" = $1),
                  (SELECT COUNT(*)  AS "dislikesCount" FROM "${TablesNames.ExtendedLikesCommentInfo}" WHERE status = 'Dislike'  AND "commentId" = $1)
                  FROM "${TablesNames.ExtendedLikesCommentInfo}" AS like_comment
                  JOIN "${TablesNames.Users}" AS user_owner
                  ON like_comment."userOwnerId" = user_owner.id
                  WHERE like_comment."commentId" = $1 AND user_owner."userIsBanned" = false
                  GROUP BY like_comment.id, like_comment."userOwnerId", like_comment."status"`;

    const values1 = [commentID];

    const commentLikes = await this.dataSource.query(text1, values1);

    if (userID !== 'quest' && commentLikes.length > 0) {
      const findUserLike = commentLikes.find((l) => l.userOwnerId === userID);

      if (findUserLike) {
        userStatus = findUserLike.status;
      }
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
        likesCount: commentLikes.length > 0 ? commentLikes[0].likesCount : 0,
        dislikesCount:
          commentLikes.length > 0 ? commentLikes[0].dislikesCount : 0,
        myStatus: userStatus,
      },
    };
  }
}
