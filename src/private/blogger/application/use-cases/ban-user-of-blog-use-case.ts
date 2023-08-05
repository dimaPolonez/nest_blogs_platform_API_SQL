import {
  BanUserOfBlogType,
  BlogsTableType,
  UsersTableType,
} from '../../../../core/models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerRepository } from '../../repository/blogger.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class BanUserOfBlogCommand {
  constructor(
    public readonly userToken: string,
    public readonly banUserOfBlogDTO: BanUserOfBlogType,
    public readonly userID: string,
  ) {}
}

@CommandHandler(BanUserOfBlogCommand)
export class BanUserOfBlogUseCase
  implements ICommandHandler<BanUserOfBlogCommand>
{
  constructor(protected bloggerRepository: BloggerRepository) {}

  async execute(command: BanUserOfBlogCommand) {
    const { userToken, banUserOfBlogDTO, userID } = command;

    const rawBlog: BlogsTableType[] = await this.bloggerRepository.findRawBlog(
      banUserOfBlogDTO.blogId,
    );

    if (rawBlog.length < 1) {
      throw new NotFoundException('blog not found');
    }

    const rawUser: UsersTableType[] = await this.bloggerRepository.findRawUser(
      userID,
    );

    if (rawUser.length < 1) {
      throw new NotFoundException('user not found');
    }

    if (rawBlog[0].userOwnerId !== userToken) {
      throw new ForbiddenException('The user is not the owner of the blog');
    }

    if (banUserOfBlogDTO.isBanned === true) {
      await this.bloggerRepository.addBanUserToBlog(
        banUserOfBlogDTO,
        userID,
        rawUser[0].login,
      );
    } else {
      await this.bloggerRepository.deleteBanUserToBlog(
        banUserOfBlogDTO.blogId,
        userID,
      );
    }
  }
}
