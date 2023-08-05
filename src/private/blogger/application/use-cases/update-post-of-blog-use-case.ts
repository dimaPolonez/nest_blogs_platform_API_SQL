import { BlogsTableType, UpdatePostOfBlogType } from '../../../../core/models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BloggerRepository } from '../../repository/blogger.repository';

export class UpdatePostOfBlogToBloggerCommand {
  constructor(
    public readonly bloggerId: string,
    public readonly blogID: string,
    public readonly postID: string,
    public readonly postDTO: UpdatePostOfBlogType,
  ) {}
}

@CommandHandler(UpdatePostOfBlogToBloggerCommand)
export class UpdatePostOfBlogToBloggerUseCase
  implements ICommandHandler<UpdatePostOfBlogToBloggerCommand>
{
  constructor(protected bloggerRepository: BloggerRepository) {}

  async execute(command: UpdatePostOfBlogToBloggerCommand) {
    const { bloggerId, blogID, postID, postDTO } = command;

    const rawBlog: BlogsTableType[] = await this.bloggerRepository.findRawBlog(
      blogID,
    );

    if (rawBlog.length < 1) {
      throw new NotFoundException('blog not found');
    }

    if (rawBlog[0].userOwnerId !== bloggerId) {
      throw new ForbiddenException('The user is not the owner of the blog');
    }

    const resultUpdate: number =
      await this.bloggerRepository.updateRawPostOfBlog(postID, postDTO);

    if (!resultUpdate) {
      throw new NotFoundException();
    }
  }
}
