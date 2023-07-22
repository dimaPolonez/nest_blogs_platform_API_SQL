import {
  AllBanUsersInfoType,
  BanUserOfBlogType,
} from '../../../../core/models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerRepository } from '../../repository/blogger.repository';
import { BlogModelType } from '../../../../core/entity';
import { AuthService } from '../../../../auth/application/auth.service';
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
  constructor(
    protected bloggerRepository: BloggerRepository,
    protected authService: AuthService,
  ) {}

  async execute(command: BanUserOfBlogCommand) {
    const { userToken, banUserOfBlogDTO, userID } = command;

    const findBlogSmart: BlogModelType | null =
      await this.bloggerRepository.findBlogById(banUserOfBlogDTO.blogId);

    const userLogin: string | null =
      await this.authService.findUserLoginNotChecked(userID);

    if (!userLogin) {
      throw new NotFoundException();
    }

    if (findBlogSmart.blogOwnerInfo.userId !== userToken) {
      throw new ForbiddenException();
    }

    let banDate = null;

    if (banUserOfBlogDTO.isBanned === true) {
      banDate = new Date().toISOString();
    }

    const banUserDTO: AllBanUsersInfoType = {
      id: userID,
      login: userLogin,
      banInfo: {
        isBanned: banUserOfBlogDTO.isBanned,
        banDate: banDate,
        banReason: banUserOfBlogDTO.banReason,
      },
    };

    const userIsBannedArray = findBlogSmart.banAllUsersInfo.map((v) => {
      if (v.id === userID) {
        v.banInfo.isBanned = banUserOfBlogDTO.isBanned;
        v.banInfo.banDate = banDate;
        v.banInfo.banReason = banUserOfBlogDTO.banReason;
        return false;
      }
      return true;
    });

    if (userIsBannedArray) {
      findBlogSmart.banAllUsersInfo.push(banUserDTO);
    }

    await this.bloggerRepository.save(findBlogSmart);
  }
}
