import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentModelType } from '../../../../core/entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from '../../repository/comments.repository';

export class DeleteCommentCommand {
  constructor(
    public readonly userID: string,
    public readonly commentID: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(protected commentRepository: CommentsRepository) {}

  async execute(command: DeleteCommentCommand) {
    const { userID, commentID } = command;

    const findComment: CommentModelType =
      await this.commentRepository.findCommentById(commentID);

    if (!findComment) {
      throw new NotFoundException('comment not found');
    }

    if (findComment.commentatorInfo.userId !== userID) {
      throw new ForbiddenException("You can't delete another user's comment");
    }

    await this.commentRepository.deleteComment(commentID);
  }
}
