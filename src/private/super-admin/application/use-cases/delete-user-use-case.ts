import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SuperAdminRepository } from '../../repository/super-admin.repository';
import { NotFoundException } from '@nestjs/common';

export class DeleteUserCommand {
  constructor(public readonly userID: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(protected superAdminRepository: SuperAdminRepository) {}

  async execute(command: DeleteUserCommand) {
    const { userID } = command;

    const resultDelete: number = await this.superAdminRepository.deleteUser(
      userID,
    );

    if (!resultDelete) {
      throw new NotFoundException();
    }
  }
}
