import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BcryptAdapter } from '../../../adapters';
import { AuthRepository } from '../../repository/auth.repository';
import { NewPassType } from '../../../core/models';
import { NotFoundException } from '@nestjs/common';

export class CreateNewPasswordCommand {
  constructor(public readonly newPassDTO: NewPassType) {}
}

@CommandHandler(CreateNewPasswordCommand)
export class CreateNewPasswordUseCase
  implements ICommandHandler<CreateNewPasswordCommand>
{
  constructor(
    protected authRepository: AuthRepository,
    protected bcryptAdapter: BcryptAdapter,
  ) {}

  async execute(command: CreateNewPasswordCommand) {
    const { newPassDTO } = command;

    const newPass: string = await this.bcryptAdapter.hushGenerate(
      newPassDTO.newPassword,
    );

    const resultUpdate: number =
      await this.authRepository.updateActivateUserAndPassword(
        newPassDTO.recoveryCode,
        newPass,
      );

    if (!resultUpdate) {
      throw new NotFoundException();
    }
  }
}
