import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SuperAdminRepository } from '../../repository/super-admin.repository';
import {
  BanUserType,
  MyLikeStatus,
  UpdateArrayCommentsType,
  UpdateArrayPostsType,
} from '../../../../core/models';
import {
  CommentModelType,
  PostModelType,
  UserModelType,
} from '../../../../core/entity';
import { NotFoundException } from '@nestjs/common';

export class BanUserCommand {
  constructor(
    public readonly banUserDTO: BanUserType,
    public readonly userID: string,
  ) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(protected superAdminRepository: SuperAdminRepository) {}

  async updatePostLikes(isBanned: boolean, userID: string) {
    const allPosts: PostModelType[] =
      await this.superAdminRepository.updateAllPostsIsBanned(isBanned, userID);

    const updateArrayPosts: UpdateArrayPostsType[] = [];

    allPosts.map((field) => {
      const likesCount = field.extendedLikesInfo.newestLikes.filter(
        (v) => v.myStatus === MyLikeStatus.Like && v.isBanned === false,
      );
      const dislikesCount = field.extendedLikesInfo.newestLikes.filter(
        (v) => v.myStatus === MyLikeStatus.Dislike && v.isBanned === false,
      );

      const arrayPostsDTO: UpdateArrayPostsType = {
        postID: field.id,
        likesCount: likesCount.length,
        dislikesCount: dislikesCount.length,
      };

      updateArrayPosts.push(arrayPostsDTO);
    });

    await this.superAdminRepository.updateAllPostsCounterLikes(
      updateArrayPosts,
    );
  }

  async updateCommentLikes(isBanned: boolean, userID: string) {
    const allComments: CommentModelType[] =
      await this.superAdminRepository.updateAllCommentIsBanned(
        isBanned,
        userID,
      );

    const updateArrayComments: UpdateArrayCommentsType[] = [];

    allComments.map((field) => {
      const likesCount = field.likesInfo.newestLikes.filter(
        (v) => v.myStatus === MyLikeStatus.Like && v.isBanned === false,
      );
      const dislikesCount = field.likesInfo.newestLikes.filter(
        (v) => v.myStatus === MyLikeStatus.Dislike && v.isBanned === false,
      );

      const arrayPostsDTO: UpdateArrayCommentsType = {
        commentID: field.id,
        likesCount: likesCount.length,
        dislikesCount: dislikesCount.length,
      };

      updateArrayComments.push(arrayPostsDTO);
    });

    await this.superAdminRepository.updateAllCommentsCounterLikes(
      updateArrayComments,
    );
  }

  async execute(command: BanUserCommand) {
    const { banUserDTO, userID } = command;

    const findUser: UserModelType | null =
      await this.superAdminRepository.findUserById(userID);

    if (!findUser) {
      throw new NotFoundException('user not found');
    }
    await findUser.banUser(banUserDTO);

    await this.superAdminRepository.banedActivityUser(
      banUserDTO.isBanned,
      userID,
    );

    await this.updatePostLikes(banUserDTO.isBanned, userID);
    await this.updateCommentLikes(banUserDTO.isBanned, userID);

    await this.superAdminRepository.save(findUser);
  }
}
