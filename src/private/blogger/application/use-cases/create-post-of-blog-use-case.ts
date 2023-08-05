import {
  BlogsTableType,
  CreatePostOfBlogType,
  GetPostOfBlogType,
  MyLikeStatus,
  PostsTableType,
} from '../../../../core/models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BloggerRepository } from '../../repository/blogger.repository';

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
  constructor(protected bloggerRepository: BloggerRepository) {}

  async execute(
    command: CreatePostOfBlogToBloggerCommand,
  ): Promise<GetPostOfBlogType> {
    const { bloggerId, blogID, postDTO } = command;

    const rawBlog: BlogsTableType[] = await this.bloggerRepository.findRawBlog(
      blogID,
    );

    if (rawBlog.length < 1) {
      throw new NotFoundException('blog not found');
    }

    if (rawBlog[0].userOwnerId !== bloggerId) {
      throw new ForbiddenException('The user is not the owner of the blog');
    }

    const rawNewPost: PostsTableType[] =
      await this.bloggerRepository.createPostOfBlog(
        postDTO,
        blogID,
        rawBlog[0].name,
      );

    const mappedNewPost: GetPostOfBlogType[] = rawNewPost.map((v) => {
      return {
        id: v.id,
        title: v.title,
        shortDescription: v.shortDescription,
        content: v.content,
        blogId: v.blogId,
        blogName: v.blogName,
        createdAt: v.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: MyLikeStatus.None,
          newestLikes: [],
        },
      };
    });

    return mappedNewPost[0];
  }
}
