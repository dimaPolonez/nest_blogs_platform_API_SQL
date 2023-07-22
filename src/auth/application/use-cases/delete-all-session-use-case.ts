import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../repository/auth.repository';
import { UserModelType } from '../../../core/entity';

export class DeleteAllSessionCommand {
  constructor(
    public readonly userID: string,
    public readonly deviceID: string,
  ) {}
}

@CommandHandler(DeleteAllSessionCommand)
export class DeleteAllSessionUseCase
  implements ICommandHandler<DeleteAllSessionCommand>
{
  constructor(protected authRepository: AuthRepository) {}

  async execute(command: DeleteAllSessionCommand) {
    const { userID, deviceID } = command;

    const findUser: UserModelType = await this.authRepository.findUserById(
      userID,
    );

    findUser.sessionsUser = findUser.sessionsUser.filter(
      (value) => value.deviceId === deviceID,
    );

    await this.authRepository.save(findUser);
  }
}
