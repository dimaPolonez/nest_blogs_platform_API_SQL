import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerRepository } from '../../repository/blogger.repository';
import { BlogModelType } from '../../../../core/entity';

export class DeleteBlogToBloggerCommand {
  constructor(
    public readonly bloggerId: string,
    public readonly blogID: string,
  ) {}
}

@CommandHandler(DeleteBlogToBloggerCommand)
export class DeleteBlogToBloggerUseCase
  implements ICommandHandler<DeleteBlogToBloggerCommand>
{
  constructor(protected bloggerRepository: BloggerRepository) {}

  async execute(command: DeleteBlogToBloggerCommand) {
    const { bloggerId, blogID } = command;

    const findBlog: BlogModelType | null =
      await this.bloggerRepository.findBlogById(blogID);

    if (!findBlog) {
      throw new NotFoundException('blog not found');
    }

    if (findBlog.blogOwnerInfo.userId !== bloggerId) {
      throw new ForbiddenException('The user is not the owner of the blog');
    }

    await this.bloggerRepository.deleteBlog(blogID);
  }
}
