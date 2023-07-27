import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ActiveCodeAdapter,
  BcryptAdapter,
  MailerAdapter,
} from '../../../adapters';
import { AuthRepository } from '../../repository/auth.repository';
import {
  CreateUserMailType,
  UserRegistrationDTO,
  UsersTableType,
} from '../../../core/models';

export class RegistrationUserCommand {
  constructor(public readonly userRegDTO: CreateUserMailType) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    protected authRepository: AuthRepository,
    protected activeCodeAdapter: ActiveCodeAdapter,
    protected mailerAdapter: MailerAdapter,
    protected bcryptAdapter: BcryptAdapter,
  ) {}

  async execute(command: RegistrationUserCommand) {
    const { userRegDTO } = command;

    const hushPass: string = await this.bcryptAdapter.hushGenerate(
      userRegDTO.password,
    );

    const authParams = await this.activeCodeAdapter.createCode();

    const newUserDTO: UserRegistrationDTO = {
      login: userRegDTO.login,
      hushPass: hushPass,
      email: userRegDTO.email,
      codeActivated: authParams.codeActivated,
      lifeTimeCode: authParams.lifeTimeCode,
      confirm: authParams.confirm,
    };

    const rawUser: UsersTableType[] =
      await this.authRepository.userRegistration(newUserDTO);

    await this.mailerAdapter.sendMailCode(
      rawUser[0].email,
      rawUser[0].codeActivated,
    );
  }
}
