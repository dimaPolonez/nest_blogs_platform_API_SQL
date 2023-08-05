import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SuperAdminRepository } from '../../repository/super-admin.repository';
import { BanBlogType } from '../../../../core/models';
import { NotFoundException } from '@nestjs/common';

export class BanBlogCommand {
  constructor(
    public readonly banBlogDTO: BanBlogType,
    public readonly blogID: string,
  ) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
  constructor(protected superAdminRepository: SuperAdminRepository) {}

  async execute(command: BanBlogCommand) {
    const { banBlogDTO, blogID } = command;

    const resultBan: number = await this.superAdminRepository.bannedRawBlog(
      banBlogDTO.isBanned,
      blogID,
    );

    if (!resultBan) {
      throw new NotFoundException();
    }
  }
}
