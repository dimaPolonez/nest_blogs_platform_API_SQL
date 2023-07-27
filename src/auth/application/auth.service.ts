import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  LoginType,
  SessionsUsersInfoType,
  UsersTableType,
} from '../../core/models';
import { BcryptAdapter } from '../../adapters';
import { BlogModelType, UserModel, UserModelType } from '../../core/entity';
import { AuthRepository } from '../repository/auth.repository';

@Injectable()
export class AuthService {
  constructor(
    protected authRepository: AuthRepository,
    protected bcryptAdapter: BcryptAdapter,
  ) {}

  async checkUser(userID: string): Promise<boolean> {
    const checkedUser: UserModelType | null =
      await this.authRepository.findUserById(userID);

    if (!checkedUser) {
      return false;
    }
    return true;
  }

  async userBlockedToBlog(userID: string, blogID: string): Promise<boolean> {
    const blockedUserArray: BlogModelType | null =
      await this.authRepository.userBlockedToBlog(userID, blogID);

    let findBanUser = false;

    blockedUserArray.banAllUsersInfo.map((v) => {
      if (v.id === userID && v.banInfo.isBanned === true) {
        findBanUser = true;
      }
    });

    return findBanUser;
  }

  async checkedConfirmCode(codeConfirm: string): Promise<boolean> {
    const findUserByCode: UserModelType | null =
      await this.authRepository.findUserByCode(codeConfirm);
    if (!findUserByCode) {
      return false;
    }

    const codeValid: boolean = await findUserByCode.checkedActivateCodeValid();

    if (!codeValid) {
      return false;
    }

    return true;
  }

  async checkedUniqueEmail(email: string): Promise<boolean> {
    const checkedUniqueEmail: UserModelType | null =
      await this.authRepository.checkedEmail(email);

    if (checkedUniqueEmail) {
      return false;
    }

    return true;
  }

  async checkedEmailToBase(email: string): Promise<boolean> {
    const checkedEmailToBase: UserModelType | null =
      await this.authRepository.checkedEmail(email);

    if (!checkedEmailToBase) {
      return false;
    }

    if (checkedEmailToBase.activateUser.confirm === true) {
      return false;
    }

    return true;
  }

  async checkedUniqueLogin(login: string): Promise<boolean> {
    const checkedUniqueLogin: UserModelType | null =
      await this.authRepository.checkedUniqueLogin(login);

    if (checkedUniqueLogin) {
      return false;
    }

    return true;
  }

  async findUserLoginNotChecked(userID: string): Promise<string | null> {
    const findUser: UserModelType | null =
      await this.authRepository.findUserById(userID);

    if (!findUser) {
      return null;
    }

    return findUser.login;
  }

  async findUserLogin(userID: string): Promise<string> {
    const rowUser: UsersTableType[] = await this.authRepository.findUser(
      userID,
    );
    if (rowUser.length < 1) {
      throw new UnauthorizedException('Token is not valid');
    }
    return rowUser[0].login;
  }
  async validateUser(loginDTO: LoginType): Promise<null | string> {
    const rowUser: UsersTableType[] =
      await this.authRepository.findUserEmailOrLogin(loginDTO.loginOrEmail);

    if (rowUser.length < 1 || rowUser[0].userIsBanned === true) {
      return null;
    }

    const validPassword: boolean = await this.bcryptAdapter.hushCompare(
      loginDTO.password,
      rowUser[0].hushPass,
    );

    if (!validPassword) {
      return null;
    }

    return rowUser[0].id;
  }

  async checkedActiveSession(
    deviceID: string,
    lastDateToken: number,
  ): Promise<boolean> {
    const rawSession: SessionsUsersInfoType[] =
      await this.authRepository.findSession(deviceID);

    if (rawSession.length < 1) {
      return false;
    }

    const lastActiveToSecond = Number(
      Date.parse(rawSession[0].lastActiveDate).toString().slice(0, 10),
    );

    if (lastActiveToSecond > lastDateToken) {
      return false;
    }

    return true;
  }
}
