import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BlogsTableType,
  CreateBlogType,
  GetBlogType,
} from '../../../../core/models';
import { BloggerRepository } from '../../repository/blogger.repository';

export class CreateBlogToBloggerCommand {
  constructor(
    public readonly userID: string,
    public readonly userLogin: string,
    public readonly blogDTO: CreateBlogType,
  ) {}
}

@CommandHandler(CreateBlogToBloggerCommand)
export class CreateBlogToBloggerUseCase
  implements ICommandHandler<CreateBlogToBloggerCommand>
{
  constructor(protected readonly bloggerRepository: BloggerRepository) {}

  async execute(command: CreateBlogToBloggerCommand): Promise<GetBlogType> {
    const { userID, userLogin, blogDTO } = command;

    const rawBlog: BlogsTableType[] = await this.bloggerRepository.createBlog(
      blogDTO,
      userID,
      userLogin,
    );

    const mappedBlog: GetBlogType[] = rawBlog.map((v) => {
      return {
        id: v.id,
        name: v.name,
        description: v.description,
        websiteUrl: v.websiteUrl,
        createdAt: v.createdAt,
        isMembership: v.isMembership,
      };
    });

    return mappedBlog[0];
  }
}
