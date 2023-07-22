import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BloggerRepository } from '../../repository/blogger.repository';
import {
  BlogModelType,
  PostModel,
  PostModelType,
} from '../../../../core/entity';

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
  constructor(
    protected bloggerRepository: BloggerRepository,
    @InjectModel(PostModel.name)
    private readonly PostModel: Model<PostModelType>,
  ) {}

  async execute(command: DeletePostOfBlogToBloggerCommand) {
    const { bloggerId, blogID, postID } = command;

    const findBlog: BlogModelType | null =
      await this.bloggerRepository.findBlogById(blogID);

    if (!findBlog) {
      throw new NotFoundException('blog not found');
    }

    if (findBlog.blogOwnerInfo.userId !== bloggerId) {
      throw new ForbiddenException('The user is not the owner of the blog');
    }

    const findPost: PostModelType | null =
      await this.bloggerRepository.findPostById(postID);

    if (!findPost) {
      throw new NotFoundException('post not found');
    }

    await this.bloggerRepository.deletePost(postID);
  }
}
