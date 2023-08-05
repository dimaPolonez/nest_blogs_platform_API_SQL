import {
  BanAllUsersOfBlogInfoType,
  CommentsTableType,
  CreateCommentOfPostType,
  GetCommentOfPostType,
  MyLikeStatus,
  PostsTableType,
} from '../../../../core/models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../repository/posts.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class CreateCommentOfPostCommand {
  constructor(
    public readonly postID: string,
    public readonly commentDTO: CreateCommentOfPostType,
    public readonly userID: string,
    public readonly login: string,
  ) {}
}

@CommandHandler(CreateCommentOfPostCommand)
export class CreateCommentOfPostUseCase
  implements ICommandHandler<CreateCommentOfPostCommand>
{
  constructor(protected postRepository: PostsRepository) {}

  async execute(
    command: CreateCommentOfPostCommand,
  ): Promise<GetCommentOfPostType> {
    const { postID, commentDTO, userID, login } = command;

    const rawPost: PostsTableType[] = await this.postRepository.findRawPostById(
      postID,
    );

    if (rawPost.length < 1) {
      throw new NotFoundException('post not found');
    }

    const userBlockedToBlog: BanAllUsersOfBlogInfoType[] =
      await this.postRepository.checkedBanUserToBlog(userID, rawPost[0].blogId);

    if (userBlockedToBlog.length > 0) {
      throw new ForbiddenException();
    }

    const rawNewComment: CommentsTableType[] =
      await this.postRepository.addNewCommentToPost(
        userID,
        login,
        postID,
        commentDTO.content,
      );

    const mappedRawNewComment: GetCommentOfPostType[] = rawNewComment.map(
      (field) => {
        return {
          id: field.id,
          content: field.content,
          commentatorInfo: {
            userId: field.userOwnerId,
            userLogin: field.userOwnerLogin,
          },
          createdAt: field.createdAt,
          likesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: MyLikeStatus.None,
          },
        };
      },
    );

    return mappedRawNewComment[0];
  }
}
