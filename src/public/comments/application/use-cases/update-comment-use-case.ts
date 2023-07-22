import { UpdateCommentType } from '../../../../core/models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentModelType } from '../../../../core/entity';
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

    const findComment: CommentModelType | null =
      await this.commentRepository.findCommentById(commentID);

    if (!findComment) {
      throw new NotFoundException('comment not found');
    }

    if (findComment.commentatorInfo.userId !== userID) {
      throw new ForbiddenException("You can't update another user's comment");
    }

    await findComment.updateComment(commentDTO);

    await this.commentRepository.save(findComment);
  }
}
