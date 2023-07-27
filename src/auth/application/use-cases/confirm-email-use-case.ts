import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../repository/auth.repository';
import { NotFoundException } from '@nestjs/common';

export class ConfirmEmailCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(protected authRepository: AuthRepository) {}

  async execute(command: ConfirmEmailCommand) {
    const { code } = command;

    const resultUpdate: number = await this.authRepository.updateActivateUser(
      code,
    );

    if (!resultUpdate) {
      throw new NotFoundException();
    }
  }
}
