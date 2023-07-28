import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../repository/auth.repository';
import { SessionsUsersInfoType } from '../../../core/models';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteAllSessionsCommand {
  constructor(
    public readonly userID: string,
    public readonly deviceID: string,
  ) {}
}

@CommandHandler(DeleteAllSessionsCommand)
export class DeleteAllSessionsUseCase
  implements ICommandHandler<DeleteAllSessionsCommand>
{
  constructor(protected authRepository: AuthRepository) {}

  async execute(command: DeleteAllSessionsCommand) {
    const { userID, deviceID } = command;

    const rowSession: SessionsUsersInfoType[] =
      await this.authRepository.findSession(deviceID);

    if (rowSession.length < 1) {
      throw new NotFoundException();
    }

    if (rowSession[0].userId !== userID) {
      throw new ForbiddenException();
    }

    const resultDelete: number = await this.authRepository.deleteAllSession(
      userID,
      deviceID,
    );

    if (!resultDelete) {
      throw new NotFoundException();
    }
  }
}
