import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../repository/auth.repository';
import { UserModelType } from '../../../core/entity';
import { ConfirmUserType } from '../../../core/models';

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

    const findUserByCode: UserModelType =
      await this.authRepository.findUserByCode(code);

    const newUserDTO: ConfirmUserType = {
      codeActivated: 'Activated',
      lifeTimeCode: 'Activated',
      confirm: true,
    };

    await findUserByCode.updateActivateUser(newUserDTO);

    await this.authRepository.save(findUserByCode);
  }
}
