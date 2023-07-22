import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../repository/auth.repository';
import { UserModelType } from '../../../core/entity';
import { GetSessionUserType } from '../../../core/models';

export class GetAllSessionCommand {
  constructor(public readonly userID: string) {}
}

@CommandHandler(GetAllSessionCommand)
export class GetAllSessionUseCase
  implements ICommandHandler<GetAllSessionCommand>
{
  constructor(protected authRepository: AuthRepository) {}

  async execute(command: GetAllSessionCommand): Promise<GetSessionUserType[]> {
    const { userID } = command;

    const findUser: UserModelType = await this.authRepository.findUserById(
      userID,
    );

    return findUser.sessionsUser.map((field) => {
      return {
        deviceId: field.deviceId,
        ip: field.ip,
        lastActiveDate: field.lastActiveDate,
        title: field.title,
      };
    });
  }
}
