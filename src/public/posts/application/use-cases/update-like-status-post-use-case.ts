import {
  ExtendedLikesPostInfoType,
  MyLikeStatus,
  PostsTableType,
} from '../../../../core/models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../repository/posts.repository';
import { NotFoundException } from '@nestjs/common';

export class UpdateLikeStatusPostCommand {
  constructor(
    public readonly userID: string,
    public readonly login: string,
    public readonly postID: string,
    public readonly likeStatus: MyLikeStatus,
  ) {}
}

@CommandHandler(UpdateLikeStatusPostCommand)
export class UpdateLikeStatusPostUseCase
  implements ICommandHandler<UpdateLikeStatusPostCommand>
{
  constructor(protected postRepository: PostsRepository) {}

  async execute(command: UpdateLikeStatusPostCommand) {
    const { userID, login, postID, likeStatus } = command;

    const rawPost: PostsTableType[] = await this.postRepository.findRawPostById(
      postID,
    );

    if (rawPost.length < 1) {
      throw new NotFoundException('post not found');
    }

    const rawLikesToPost: ExtendedLikesPostInfoType[] =
      await this.postRepository.findLikesToPost(postID, userID);

    if (rawLikesToPost.length < 1 && likeStatus !== MyLikeStatus.None) {
      await this.postRepository.addNewLikeToPost(
        userID,
        login,
        postID,
        likeStatus,
      );
      return;
    }

    if (likeStatus === MyLikeStatus.None) {
      await this.postRepository.deleteLikeToPost(userID, postID);
      return;
    }

    await this.postRepository.updateLikeToPost(userID, postID, likeStatus);
  }
}
