import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SuperAdminRepository } from '../../repository/super-admin.repository';
import { BlogModelType, UserModelType } from '../../../../core/entity';

export class BindBlogCommand {
  constructor(public readonly blogID: string, public readonly userID: string) {}
}

@CommandHandler(BindBlogCommand)
export class BindBlogUseCase implements ICommandHandler<BindBlogCommand> {
  constructor(protected superAdminRepository: SuperAdminRepository) {}

  async execute(command: BindBlogCommand) {
    const { blogID, userID } = command;

    const findBlog: BlogModelType | null =
      await this.superAdminRepository.findBlogById(blogID);

    if (!findBlog) {
      throw new NotFoundException('blog not found');
    }

    const findUser: UserModelType | null =
      await this.superAdminRepository.findUserById(userID);

    if (!findUser) {
      throw new NotFoundException('user not found');
    }

    if (!findBlog.blogOwnerInfo.userId) {
      await findBlog.bindBlog({
        userId: findUser.id,
        userLogin: findUser.login,
      });
    }

    await this.superAdminRepository.save(findBlog);
  }
}
