import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BcryptAdapter } from '../../../adapters';
import { AuthRepository } from '../../repository/auth.repository';
import { UserModelType } from '../../../core/entity';
import { ConfirmUserType, NewPassType } from '../../../core/models';

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

    const findUserByCode: UserModelType =
      await this.authRepository.findUserByCode(newPassDTO.recoveryCode);

    const newUserDTO: ConfirmUserType = {
      codeActivated: 'Activated',
      lifeTimeCode: 'Activated',
      confirm: true,
    };

    const newPass: string = await this.bcryptAdapter.hushGenerate(
      newPassDTO.newPassword,
    );

    await findUserByCode.updateActivateUserAndPassword(newUserDTO, newPass);

    await this.authRepository.save(findUserByCode);
  }
}
