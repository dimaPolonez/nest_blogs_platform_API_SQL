import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../repository/auth.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SessionsUsersInfoType } from '../../../core/models';

export class DeleteOneSessionCommand {
  constructor(
    public readonly userID: string,
    public readonly deviceID: string,
  ) {}
}

@CommandHandler(DeleteOneSessionCommand)
export class DeleteOneSessionUseCase
  implements ICommandHandler<DeleteOneSessionCommand>
{
  constructor(protected authRepository: AuthRepository) {}

  async execute(command: DeleteOneSessionCommand) {
    const { userID, deviceID } = command;

    const rowSession: SessionsUsersInfoType[] =
      await this.authRepository.findSession(deviceID);

    if (rowSession.length < 1) {
      throw new NotFoundException();
    }

    if (rowSession[0].userId !== userID) {
      throw new ForbiddenException();
    }

    const resultDelete: number = await this.authRepository.deleteOneSession(
      deviceID,
    );

    if (!resultDelete) {
      throw new NotFoundException();
    }
  }
}
