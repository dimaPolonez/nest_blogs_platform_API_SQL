import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ActiveCodeAdapter, MailerAdapter } from '../../../adapters';
import { AuthRepository } from '../../repository/auth.repository';
import { UserModelType } from '../../../core/entity';
import { ConfirmUserType } from '../../../core/models';

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

    const findUserEmailToBase: UserModelType =
      await this.authRepository.findUserEmailToBase(email);

    const authParams: ConfirmUserType =
      await this.activeCodeAdapter.createCode();

    await findUserEmailToBase.updateActivateUser(authParams);

    await this.authRepository.save(findUserEmailToBase);

    await this.mailerAdapter.sendMailPass(
      findUserEmailToBase.email,
      findUserEmailToBase.activateUser.codeActivated,
    );
  }
}
