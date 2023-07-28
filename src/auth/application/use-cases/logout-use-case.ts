import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../repository/auth.repository';
import { SessionsUsersInfoType } from '../../../core/models';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class LogoutCommand {
  constructor(
    public readonly userID: string,
    public readonly deviceID: string,
  ) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(protected authRepository: AuthRepository) {}

  async execute(command: LogoutCommand) {
    const { userID, deviceID } = command;

    const rowSession: SessionsUsersInfoType[] =
      await this.authRepository.findSession(deviceID);

    if (rowSession.length < 1) {
      throw new NotFoundException();
    }

    if (rowSession[0].userId !== userID) {
      throw new ForbiddenException();
    }

    const resultDelete: number = await this.authRepository.logoutUser(userID);

    if (!resultDelete) {
      throw new NotFoundException();
    }
  }
}
