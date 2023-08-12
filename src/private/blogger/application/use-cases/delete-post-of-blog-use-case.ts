import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BloggerRepository } from '../../repository/blogger.repository';
import { BlogsTableType } from '../../../../core/models';

export class DeletePostOfBlogToBloggerCommand {
  constructor(
    public readonly bloggerId: string,
    public readonly blogID: string,
    public readonly postID: string,
  ) {}
}

@CommandHandler(DeletePostOfBlogToBloggerCommand)
export class DeletePostOfBlogToBloggerUseCase
  implements ICommandHandler<DeletePostOfBlogToBloggerCommand>
{
  constructor(protected bloggerRepository: BloggerRepository) {}

  async execute(command: DeletePostOfBlogToBloggerCommand) {
    const { bloggerId, blogID, postID } = command;

    const rawBlog: BlogsTableType[] = await this.bloggerRepository.findRawBlog(
      blogID,
    );

    if (rawBlog.length < 1) {
      throw new NotFoundException('blog not found');
    }

    if (rawBlog[0].userOwnerId !== bloggerId) {
      throw new ForbiddenException('The user is not the owner of the blog');
    }

    const resultDelete: number =
      await this.bloggerRepository.deleteRawPostOfBlog(postID);

    if (!resultDelete) {
      throw new NotFoundException();
    }
  }
}
