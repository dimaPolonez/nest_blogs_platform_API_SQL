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

    const rawSession: SessionsUsersInfoType[] =
      await this.authRepository.findSession(deviceID);

    if (rawSession.length < 1) {
      throw new NotFoundException();
    }

    if (rawSession[0].userId !== userID) {
      throw new ForbiddenException();
    }

    const resultDelete: number = await this.authRepository.logoutUser(deviceID);

    if (!resultDelete) {
      throw new NotFoundException();
    }
  }
}
