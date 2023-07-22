import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GetCommentType,
  MyLikeStatus,
  NewestLikesType,
} from '../../../core/models';
import { CommentModel, CommentModelType } from '../../../core/entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(CommentModel.name)
    private readonly CommentModel: Model<CommentModelType>,
  ) {}

  async findCommentById(
    commentID: string,
    userID?: string,
  ): Promise<GetCommentType> {
    const findCommentSmart: CommentModelType = await this.CommentModel.findById(
      commentID,
    );

    if (
      !findCommentSmart ||
      findCommentSmart.commentatorInfo.isBanned === true
    ) {
      throw new NotFoundException('comment not found');
    }

    let userStatus = MyLikeStatus.None;

    if (userID !== 'quest') {
      const findUserLike: null | NewestLikesType =
        findCommentSmart.likesInfo.newestLikes.find((l) => l.userId === userID);

      if (findUserLike) {
        userStatus = findUserLike.myStatus;
      }
    }

    return {
      id: findCommentSmart.id,
      content: findCommentSmart.content,
      commentatorInfo: {
        userId: findCommentSmart.commentatorInfo.userId,
        userLogin: findCommentSmart.commentatorInfo.userLogin,
      },
      createdAt: findCommentSmart.createdAt,
      likesInfo: {
        likesCount: findCommentSmart.likesInfo.likesCount,
        dislikesCount: findCommentSmart.likesInfo.dislikesCount,
        myStatus: userStatus,
      },
    };
  }
}
