import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ActiveCodeAdapter, MailerAdapter } from '../../../adapters';
import { AuthRepository } from '../../repository/auth.repository';
import { ConfirmUserType } from '../../../core/models';
import { NotFoundException } from '@nestjs/common';

export class PasswordRecoveryCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    protected authRepository: AuthRepository,
    protected activeCodeAdapter: ActiveCodeAdapter,
    protected mailerAdapter: MailerAdapter,
  ) {}

  async execute(command: PasswordRecoveryCommand) {
    const { email } = command;

    const authParams: ConfirmUserType =
      await this.activeCodeAdapter.createCode();

    const resultUpdate: number = await this.authRepository.recoveryCode(
      authParams,
      email,
    );

    if (!resultUpdate) {
      throw new NotFoundException();
    }

    await this.mailerAdapter.sendMailPass(email, authParams.codeActivated);
  }
}
