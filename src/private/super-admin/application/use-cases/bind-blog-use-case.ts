import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SuperAdminRepository } from '../../repository/super-admin.repository';
import { BlogsTableType, UsersTableType } from '../../../../core/models';

export class BindBlogCommand {
  constructor(public readonly blogID: string, public readonly userID: string) {}
}

@CommandHandler(BindBlogCommand)
export class BindBlogUseCase implements ICommandHandler<BindBlogCommand> {
  constructor(protected superAdminRepository: SuperAdminRepository) {}

  async execute(command: BindBlogCommand) {
    const { blogID, userID } = command;

    const rawUser: UsersTableType[] =
      await this.superAdminRepository.findUserByIdSql(userID);

    if (rawUser.length < 1) {
      throw new NotFoundException('user not found');
    }

    const rawBlog: BlogsTableType[] =
      await this.superAdminRepository.findBlogByIdSql(blogID);

    if (rawBlog.length < 1) {
      throw new NotFoundException('blog not found');
    }

    if (!rawBlog[0].userOwnerId) {
      await this.superAdminRepository.bindBlogToUser(
        blogID,
        userID,
        rawUser[0].login,
      );
    }
  }
}
