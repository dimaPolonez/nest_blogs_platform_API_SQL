import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SuperAdminRepository } from '../../repository/super-admin.repository';
import { UserModelType } from '../../../../core/entity';
import { NotFoundException } from '@nestjs/common';

export class DeleteUserCommand {
  constructor(public readonly userID: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(protected superAdminRepository: SuperAdminRepository) {}

  async execute(command: DeleteUserCommand) {
    const { userID } = command;

    const findUser: UserModelType =
      await this.superAdminRepository.findUserById(userID);

    if (!findUser) {
      throw new NotFoundException('user not found');
    }

    await this.superAdminRepository.deleteUser(userID);
  }
}
