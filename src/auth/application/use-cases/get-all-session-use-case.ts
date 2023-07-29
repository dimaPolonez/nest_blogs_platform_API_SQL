import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../repository/auth.repository';
import {
  GetSessionUserType,
  SessionsUsersInfoType,
} from '../../../core/models';

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

    const rowSessions: SessionsUsersInfoType[] =
      await this.authRepository.findUserSessions(userID);

    return rowSessions.map((field) => {
      return {
        deviceId: field.id,
        ip: field.ip,
        lastActiveDate: field.lastActiveDate,
        title: field.title,
      };
    });
  }
}
