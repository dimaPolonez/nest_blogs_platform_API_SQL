import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../repository/auth.repository';
import { NotFoundException } from '@nestjs/common';

export class DeleteOneSessionCommand {
  constructor(
    public readonly userID: string,
    public readonly deviceID: string,
  ) {}
}

@CommandHandler(DeleteOneSessionCommand)
export class DeleteOneSessionUseCase
  implements ICommandHandler<DeleteOneSessionCommand>
{
  constructor(protected authRepository: AuthRepository) {}

  async execute(command: DeleteOneSessionCommand) {
    const { userID, deviceID } = command;

    const resultDelete: number = await this.authRepository.deleteOneSession(
      userID,
      deviceID,
    );

    if (!resultDelete) {
      throw new NotFoundException();
    }
  }
}
