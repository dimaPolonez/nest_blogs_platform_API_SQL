import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBlogType } from '../../../../core/models';
import { BloggerRepository } from '../../repository/blogger.repository';
import { BlogModel, BlogModelType } from '../../../../core/entity';

export class CreateBlogToBloggerCommand {
  constructor(
    public readonly userId: string,
    public readonly userLogin: string,
    public readonly blogDTO: CreateBlogType,
  ) {}
}

@CommandHandler(CreateBlogToBloggerCommand)
export class CreateBlogToBloggerUseCase
  implements ICommandHandler<CreateBlogToBloggerCommand>
{
  constructor(
    protected readonly bloggerRepository: BloggerRepository,
    @InjectModel(BlogModel.name)
    protected readonly BlogModel: Model<BlogModelType>,
  ) {}

  async execute(command: CreateBlogToBloggerCommand): Promise<string> {
    const { userId, userLogin, blogDTO } = command;

    const createBlogSmart: BlogModelType = new this.BlogModel({
      ...blogDTO,
      blogOwnerInfo: {
        userId: userId,
        userLogin: userLogin,
      },
    });

    await this.bloggerRepository.save(createBlogSmart);

    return createBlogSmart.id;
  }
}
