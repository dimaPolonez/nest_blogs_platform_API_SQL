import { MyLikeStatus, NewestLikesType } from '../../../../core/models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../repository/posts.repository';
import { PostModelType } from '../../../../core/entity';
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

  async likeCounter(
    post: PostModelType,
    likeStatus: MyLikeStatus,
    likeCaseString?: string,
  ) {
    if (likeStatus === MyLikeStatus.Like) {
      post.extendedLikesInfo.likesCount++;
    }
    if (likeStatus === MyLikeStatus.Dislike) {
      post.extendedLikesInfo.dislikesCount++;
    }

    switch (likeCaseString) {
      case 'LikeDislike':
        post.extendedLikesInfo.likesCount++;
        post.extendedLikesInfo.dislikesCount--;
        break;
      case 'DislikeLike':
        post.extendedLikesInfo.likesCount--;
        post.extendedLikesInfo.dislikesCount++;
        break;
      case 'NoneDislike':
        post.extendedLikesInfo.dislikesCount--;
        break;
      case 'NoneLike':
        post.extendedLikesInfo.likesCount--;
        break;
    }
  }

  async execute(command: UpdateLikeStatusPostCommand) {
    const { userID, login, postID, likeStatus } = command;

    const findPost: PostModelType = await this.postRepository.findPostById(
      postID,
    );

    if (!findPost) {
      throw new NotFoundException('post not found');
    }

    const userActive: NewestLikesType | null =
      findPost.extendedLikesInfo.newestLikes.find((v) => v.userId === userID);

    const likesObjectDTO: NewestLikesType = {
      userId: userID,
      login: login,
      myStatus: likeStatus,
      addedAt: new Date().toISOString(),
      isBanned: false,
    };

    if (!userActive) {
      if (likeStatus === 'None') {
        return;
      }
      await this.likeCounter(findPost, likeStatus);
      findPost.extendedLikesInfo.newestLikes.push(likesObjectDTO);
      await this.postRepository.save(findPost);
      return;
    }
    if (userActive.myStatus !== likeStatus) {
      const likeCaseString = likeStatus + userActive.myStatus;
      await this.likeCounter(findPost, MyLikeStatus.None, likeCaseString);

      if (likeStatus === MyLikeStatus.None) {
        findPost.extendedLikesInfo.newestLikes =
          findPost.extendedLikesInfo.newestLikes.filter(
            (v) => v.userId !== userID,
          );
        await this.postRepository.save(findPost);
        return;
      }
      const findActivity = findPost.extendedLikesInfo.newestLikes.find(
        (v) => v.userId === userID,
      );

      findActivity.myStatus = likeStatus;

      findPost.extendedLikesInfo.newestLikes =
        findPost.extendedLikesInfo.newestLikes.filter(
          (v) => v.userId !== userID,
        );

      findPost.extendedLikesInfo.newestLikes.push(findActivity);

      await this.postRepository.save(findPost);
    }
  }
}
