import { CommentsTableType, UpdateCommentType } from '../../../../core/models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from '../../repository/comments.repository';

export class UpdateCommentCommand {
  constructor(
    public readonly userID: string,
    public readonly commentID: string,
    public readonly commentDTO: UpdateCommentType,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(protected commentRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand) {
    const { userID, commentID, commentDTO } = command;

    const rawComment: CommentsTableType[] =
      await this.commentRepository.findRawCommentById(commentID);

    if (rawComment.length < 1) {
      throw new NotFoundException('comment not found');
    }

    if (rawComment[0].userOwnerId !== userID) {
      throw new ForbiddenException("You can't update another user's comment");
    }

    await this.commentRepository.updateRawCommentById(
      commentID,
      commentDTO.content,
    );
  }
}
