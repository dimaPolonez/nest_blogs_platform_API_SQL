import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ActiveCodeAdapter,
  BcryptAdapter,
  MailerAdapter,
} from '../../../adapters';
import { AuthRepository } from '../../repository/auth.repository';
import { UserModel, UserModelType } from '../../../core/entity';
import { CreateUserMailType } from '../../../core/models';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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
    @InjectModel(UserModel.name)
    private readonly UserModel: Model<UserModelType>,
  ) {}

  async execute(command: RegistrationUserCommand) {
    const { userRegDTO } = command;

    const hushPass: string = await this.bcryptAdapter.hushGenerate(
      userRegDTO.password,
    );

    const authParams = await this.activeCodeAdapter.createCode();

    const newUserDTO = {
      login: userRegDTO.login,
      hushPass: hushPass,
      email: userRegDTO.email,
      activateUser: {
        codeActivated: authParams.codeActivated,
        lifeTimeCode: authParams.lifeTimeCode,
        confirm: authParams.confirm,
      },
    };

    const createUserSmart: UserModelType = await new this.UserModel(newUserDTO);

    await this.authRepository.save(createUserSmart);

    await this.mailerAdapter.sendMailCode(
      userRegDTO.email,
      authParams.codeActivated,
    );
  }
}
