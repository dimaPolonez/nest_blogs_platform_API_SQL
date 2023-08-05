import {
  CommentsTableType,
  ExtendedLikesCommentInfoType,
  MyLikeStatus,
} from '../../../../core/models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
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

  async execute(command: UpdateLikeStatusCommentCommand) {
    const { userID, login, commentID, likeStatus } = command;

    const rawComment: CommentsTableType[] =
      await this.commentRepository.findRawCommentById(commentID);

    if (rawComment.length < 1) {
      throw new NotFoundException('comment not found');
    }

    const rawLikesToComment: ExtendedLikesCommentInfoType[] =
      await this.commentRepository.findLikesToComment(commentID, userID);

    if (rawLikesToComment.length < 1 && likeStatus !== MyLikeStatus.None) {
      await this.commentRepository.addNewLikeToComment(
        userID,
        login,
        commentID,
        likeStatus,
      );
      return;
    }

    if (likeStatus === MyLikeStatus.None) {
      await this.commentRepository.deleteLikeToComment(userID, commentID);
      return;
    }

    await this.commentRepository.updateLikeToComment(
      userID,
      commentID,
      likeStatus,
    );
  }
}
