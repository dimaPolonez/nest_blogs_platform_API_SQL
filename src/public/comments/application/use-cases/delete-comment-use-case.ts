import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from '../../repository/comments.repository';
import { CommentsTableType } from '../../../../core/models';

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

    const rawComment: CommentsTableType[] =
      await this.commentRepository.findRawCommentById(commentID);

    if (rawComment.length < 1) {
      throw new NotFoundException('comment not found');
    }

    if (rawComment[0].userOwnerId !== userID) {
      throw new ForbiddenException("You can't delete another user's comment");
    }

    await this.commentRepository.deleteRawCommentById(commentID);
  }
}
