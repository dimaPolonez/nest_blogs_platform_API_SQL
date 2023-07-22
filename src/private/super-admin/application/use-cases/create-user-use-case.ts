import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SuperAdminRepository } from '../../repository/super-admin.repository';
import { UserModel, UserModelType } from '../../../../core/entity';
import { CreateUserType } from '../../../../core/models';
import { BcryptAdapter } from '../../../../adapters';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class CreateUserCommand {
  constructor(public readonly userDTO: CreateUserType) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectModel(UserModel.name)
    private readonly UserModel: Model<UserModelType>,
    protected superAdminRepository: SuperAdminRepository,
    protected bcryptAdapter: BcryptAdapter,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const { userDTO } = command;

    const hushPass: string = await this.bcryptAdapter.hushGenerate(
      userDTO.password,
    );

    const newUserDTO = {
      login: userDTO.login,
      hushPass: hushPass,
      email: userDTO.email,
    };

    const createUserSmart: UserModelType = await new this.UserModel(newUserDTO);

    await this.superAdminRepository.save(createUserSmart);

    return createUserSmart.id;
  }
}
