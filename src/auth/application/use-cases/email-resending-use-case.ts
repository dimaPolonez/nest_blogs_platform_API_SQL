import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ActiveCodeAdapter, MailerAdapter } from '../../../adapters';
import { AuthRepository } from '../../repository/auth.repository';
import { ConfirmUserType } from '../../../core/models';
import { NotFoundException } from '@nestjs/common';

export class EmailResendingCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(EmailResendingCommand)
export class EmailResendingUseCase
  implements ICommandHandler<EmailResendingCommand>
{
  constructor(
    protected authRepository: AuthRepository,
    protected activeCodeAdapter: ActiveCodeAdapter,
    protected mailerAdapter: MailerAdapter,
  ) {}

  async execute(command: EmailResendingCommand) {
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

    await this.mailerAdapter.sendMailCode(email, authParams.codeActivated);
  }
}
