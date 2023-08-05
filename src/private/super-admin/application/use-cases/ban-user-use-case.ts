import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SuperAdminRepository } from '../../repository/super-admin.repository';
import { BanUserType } from '../../../../core/models';
import { NotFoundException } from '@nestjs/common';

export class BanUserCommand {
  constructor(
    public readonly banUserDTO: BanUserType,
    public readonly userID: string,
  ) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(protected superAdminRepository: SuperAdminRepository) {}

  async execute(command: BanUserCommand) {
    const { banUserDTO, userID } = command;

    const resultUpdate: number = await this.superAdminRepository.banedUser(
      banUserDTO,
      userID,
    );

    if (!resultUpdate) {
      throw new NotFoundException();
    }
  }
}
