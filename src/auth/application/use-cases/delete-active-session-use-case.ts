import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../repository/auth.repository';
import { UserModelType } from '../../../core/entity';
import { SessionUserType } from '../../../core/models';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteActiveSessionCommand {
  constructor(
    public readonly userID: string,
    public readonly deviceID: string,
  ) {}
}

@CommandHandler(DeleteActiveSessionCommand)
export class DeleteActiveSessionUseCase
  implements ICommandHandler<DeleteActiveSessionCommand>
{
  constructor(protected authRepository: AuthRepository) {}

  async execute(command: DeleteActiveSessionCommand) {
    const { userID, deviceID } = command;

    const findUser: UserModelType = await this.authRepository.findUserById(
      userID,
    );

    const foundSession: SessionUserType | null =
      await this.authRepository.findUserSession(deviceID);

    if (!foundSession) {
      throw new NotFoundException();
    }

    const sessionByUser = findUser.sessionsUser.find(
      (value) => value.deviceId === deviceID,
    );

    if (!sessionByUser) {
      throw new ForbiddenException();
    }

    findUser.sessionsUser = findUser.sessionsUser.filter(
      (value) => value.deviceId !== deviceID,
    );

    await this.authRepository.save(findUser);
  }
}
