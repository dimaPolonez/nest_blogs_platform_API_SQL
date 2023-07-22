import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../repository/auth.repository';
import { UserModelType } from '../../../core/entity';
import { AboutMeType } from '../../../core/models';

export class GetUserInfCommand {
  constructor(public readonly userID: string) {}
}

@CommandHandler(GetUserInfCommand)
export class GetUserInfUseCase implements ICommandHandler<GetUserInfCommand> {
  constructor(protected authRepository: AuthRepository) {}

  async execute(command: GetUserInfCommand) {
    const { userID } = command;

    const findUser: UserModelType = await this.authRepository.findUserById(
      userID,
    );

    return <AboutMeType>{
      email: findUser.email,
      login: findUser.login,
      userId: findUser.id,
    };
  }
}
