import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../repository/auth.repository';
import { AboutMeType, UsersTableType } from '../../../core/models';
import { NotFoundException } from '@nestjs/common';

export class GetUserInfCommand {
  constructor(public readonly userID: string) {}
}

@CommandHandler(GetUserInfCommand)
export class GetUserInfUseCase implements ICommandHandler<GetUserInfCommand> {
  constructor(protected authRepository: AuthRepository) {}

  async execute(command: GetUserInfCommand) {
    const { userID } = command;

    const rawUser: UsersTableType[] = await this.authRepository.findUser(
      userID,
    );

    if (rawUser.length < 1) {
      throw new NotFoundException();
    }

    return <AboutMeType>{
      email: rawUser[0].email,
      login: rawUser[0].login,
      userId: rawUser[0].id,
    };
  }
}
