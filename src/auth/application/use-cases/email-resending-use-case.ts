import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ActiveCodeAdapter, MailerAdapter } from '../../../adapters';
import { AuthRepository } from '../../repository/auth.repository';
import { UserModelType } from '../../../core/entity';
import { ConfirmUserType } from '../../../core/models';

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

    const findUserEmailToBase: UserModelType =
      await this.authRepository.findUserEmailToBase(email);

    const authParams: ConfirmUserType =
      await this.activeCodeAdapter.createCode();

    await findUserEmailToBase.updateActivateUser(authParams);

    await this.authRepository.save(findUserEmailToBase);

    await this.mailerAdapter.sendMailCode(
      findUserEmailToBase.email,
      authParams.codeActivated,
    );
  }
}
