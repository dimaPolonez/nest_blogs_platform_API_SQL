import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateBlogType } from '../../../../core/models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerRepository } from '../../repository/blogger.repository';
import { BlogModelType } from '../../../../core/entity';

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

    const findBlog: BlogModelType | null =
      await this.bloggerRepository.findBlogById(blogID);

    if (!findBlog) {
      throw new NotFoundException('blog not found');
    }

    if (findBlog.blogOwnerInfo.userId !== bloggerId) {
      throw new ForbiddenException('The user is not the owner of the blog');
    }

    await findBlog.updateBlog(blogDTO);

    await this.bloggerRepository.save(findBlog);
  }
}
