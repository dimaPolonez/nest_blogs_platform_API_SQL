import { MyLikeStatus, NewestLikesType } from '../../../../core/models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentModelType } from '../../../../core/entity';
import { NotFoundException } from '@nestjs/common';
import { CommentsRepository } from '../../repository/comments.repository';

export class UpdateLikeStatusCommentCommand {
  constructor(
    public readonly userID: string,
    public readonly login: string,
    public readonly commentID: string,
    public readonly likeStatus: MyLikeStatus,
  ) {}
}

@CommandHandler(UpdateLikeStatusCommentCommand)
export class UpdateLikeStatusCommentUseCase
  implements ICommandHandler<UpdateLikeStatusCommentCommand>
{
  constructor(protected commentRepository: CommentsRepository) {}

  async likeCounter(
    comment: CommentModelType,
    likeStatus: MyLikeStatus,
    likeCaseString?: string,
  ) {
    if (likeStatus === MyLikeStatus.Like) {
      comment.likesInfo.likesCount++;
    }
    if (likeStatus === MyLikeStatus.Dislike) {
      comment.likesInfo.dislikesCount++;
    }

    switch (likeCaseString) {
      case 'LikeDislike':
        comment.likesInfo.likesCount++;
        comment.likesInfo.dislikesCount--;
        break;
      case 'DislikeLike':
        comment.likesInfo.likesCount--;
        comment.likesInfo.dislikesCount++;
        break;
      case 'NoneDislike':
        comment.likesInfo.dislikesCount--;
        break;
      case 'NoneLike':
        comment.likesInfo.likesCount--;
        break;
    }
  }

  async execute(command: UpdateLikeStatusCommentCommand) {
    const { userID, login, commentID, likeStatus } = command;

    const findComment: CommentModelType | null =
      await this.commentRepository.findCommentById(commentID);

    if (!findComment) {
      throw new NotFoundException('comment not found');
    }

    const userActive: NewestLikesType | null =
      findComment.likesInfo.newestLikes.find(
        (value) => value.userId === userID,
      );

    const likesObjectDTO: NewestLikesType = {
      userId: userID,
      login: login,
      myStatus: likeStatus,
      addedAt: new Date().toISOString(),
      isBanned: false,
    };

    if (!userActive) {
      if (likeStatus === 'None') {
        return;
      }
      await this.likeCounter(findComment, likeStatus);
      findComment.likesInfo.newestLikes.push(likesObjectDTO);
      await this.commentRepository.save(findComment);
      return;
    }

    if (userActive.myStatus !== likeStatus) {
      const likeCaseString = likeStatus + userActive.myStatus;
      await this.likeCounter(findComment, MyLikeStatus.None, likeCaseString);

      if (likeStatus === MyLikeStatus.None) {
        findComment.likesInfo.newestLikes =
          findComment.likesInfo.newestLikes.filter((v) => v.userId !== userID);
        await this.commentRepository.save(findComment);
        return;
      }
      const findActivity = findComment.likesInfo.newestLikes.find(
        (v) => v.userId === userID,
      );

      findActivity.myStatus = likeStatus;

      findComment.likesInfo.newestLikes =
        findComment.likesInfo.newestLikes.filter((v) => v.userId !== userID);

      findComment.likesInfo.newestLikes.push(findActivity);

      await this.commentRepository.save(findComment);
    }
  }
}
