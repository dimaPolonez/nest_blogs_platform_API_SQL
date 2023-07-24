import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SuperAdminRepository } from '../../repository/super-admin.repository';
import {
  CreateUserType,
  GetUserAdminType,
  NewUserDTOType,
  UsersTableType,
} from '../../../../core/models';
import { BcryptAdapter } from '../../../../adapters';

export class CreateUserCommand {
  constructor(public readonly userDTO: CreateUserType) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    protected superAdminRepository: SuperAdminRepository,
    protected bcryptAdapter: BcryptAdapter,
  ) {}

  async execute(command: CreateUserCommand): Promise<GetUserAdminType> {
    const { userDTO } = command;

    const hushPass: string = await this.bcryptAdapter.hushGenerate(
      userDTO.password,
    );

    const newUserDTO: NewUserDTOType = {
      login: userDTO.login,
      hushPass: hushPass,
      email: userDTO.email,
    };

    const rawUser: UsersTableType[] =
      await this.superAdminRepository.createUser(newUserDTO);

    const mappedUser: GetUserAdminType[] = rawUser.map((v) => {
      return {
        id: v.userId,
        login: v.login,
        email: v.email,
        createdAt: v.createdAt,
        banInfo: {
          isBanned: v.userIsBanned,
          banDate: v.banDate,
          banReason: v.banReason,
        },
      };
    });

    return mappedUser[0];
  }
}
