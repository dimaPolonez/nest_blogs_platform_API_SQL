import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostOfBlogType } from '../../../../core/models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BloggerRepository } from '../../repository/blogger.repository';
import {
  BlogModelType,
  PostModel,
  PostModelType,
} from '../../../../core/entity';

export class CreatePostOfBlogToBloggerCommand {
  constructor(
    public readonly bloggerId: string,
    public readonly blogID: string,
    public readonly postDTO: CreatePostOfBlogType,
  ) {}
}

@CommandHandler(CreatePostOfBlogToBloggerCommand)
export class CreatePostOfBlogToBloggerUseCase
  implements ICommandHandler<CreatePostOfBlogToBloggerCommand>
{
  constructor(
    protected bloggerRepository: BloggerRepository,
    @InjectModel(PostModel.name)
    private readonly PostModel: Model<PostModelType>,
  ) {}

  async execute(command: CreatePostOfBlogToBloggerCommand): Promise<string> {
    const { bloggerId, blogID, postDTO } = command;

    const findBlog: BlogModelType | null =
      await this.bloggerRepository.findBlogById(blogID);

    if (!findBlog) {
      throw new NotFoundException('blog not found');
    }

    if (findBlog.blogOwnerInfo.userId !== bloggerId) {
      throw new ForbiddenException('The user is not the owner of the blog');
    }

    const createPostSmart: PostModelType = new this.PostModel({
      ...postDTO,
      blogId: blogID,
      blogName: findBlog.name,
    });

    await this.bloggerRepository.save(createPostSmart);

    return createPostSmart.id;
  }
}
