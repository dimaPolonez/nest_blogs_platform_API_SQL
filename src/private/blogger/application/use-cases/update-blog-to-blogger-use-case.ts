import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsTableType, UpdateBlogType } from '../../../../core/models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerRepository } from '../../repository/blogger.repository';

export class UpdateBlogToBloggerCommand {
  constructor(
    public readonly bloggerId: string,
    public readonly blogID: string,
    public readonly blogDTO: UpdateBlogType,
  ) {}
}

@CommandHandler(UpdateBlogToBloggerCommand)
export class UpdateBlogToBloggerUseCase
  implements ICommandHandler<UpdateBlogToBloggerCommand>
{
  constructor(protected bloggerRepository: BloggerRepository) {}

  async execute(command: UpdateBlogToBloggerCommand) {
    const { bloggerId, blogID, blogDTO } = command;

    const rawBlog: BlogsTableType[] = await this.bloggerRepository.findRawBlog(
      blogID,
    );

    if (rawBlog.length < 1) {
      throw new NotFoundException('blog not found');
    }

    if (rawBlog[0].userOwnerId !== bloggerId) {
      throw new ForbiddenException('The user is not the owner of the blog');
    }

    await this.bloggerRepository.updateRawBlog(blogID, blogDTO);
  }
}
