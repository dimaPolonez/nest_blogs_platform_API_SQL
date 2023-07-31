import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  LoginType,
  SessionsUsersInfoType,
  UsersTableType,
} from '../../core/models';
import { BcryptAdapter } from '../../adapters';
import { BlogModelType, UserModelType } from '../../core/entity';
import { AuthRepository } from '../repository/auth.repository';
import { isAfter } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    protected authRepository: AuthRepository,
    protected bcryptAdapter: BcryptAdapter,
  ) {}

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
    const rawUser: UsersTableType[] = await this.authRepository.findUserByCode(
      codeConfirm,
    );

    if (rawUser.length < 1) {
      return false;
    }

    const dateExpiredCode = Date.parse(rawUser[0].codeActivatedExpired);
    const dateNow = new Date();

    if (!isAfter(dateExpiredCode, dateNow)) {
      return false;
    }

    return true;
  }

  async checkedUniqueEmail(email: string): Promise<boolean> {
    const rawUser: UsersTableType[] = await this.authRepository.checkedEmail(
      email,
    );

    if (rawUser.length > 0) {
      return false;
    }

    return true;
  }

  async checkedEmailToBase(email: string): Promise<boolean> {
    const rawUser: UsersTableType[] = await this.authRepository.checkedEmail(
      email,
    );

    if (rawUser.length < 1) {
      return false;
    }

    if (rawUser[0].userIsConfirmed === true) {
      return false;
    }

    return true;
  }

  async checkedUniqueLogin(login: string): Promise<boolean> {
    const rawUser: UsersTableType[] =
      await this.authRepository.checkedUniqueLogin(login);

    if (rawUser.length > 0) {
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
    const rawUser: UsersTableType[] = await this.authRepository.findUser(
      userID,
    );
    if (rawUser.length < 1) {
      throw new UnauthorizedException('Token is not valid');
    }
    return rawUser[0].login;
  }
  async validateUser(loginDTO: LoginType): Promise<null | string> {
    const rawUser: UsersTableType[] =
      await this.authRepository.findUserEmailOrLogin(loginDTO.loginOrEmail);

    if (rawUser.length < 1 || rawUser[0].userIsBanned === true) {
      return null;
    }

    const validPassword: boolean = await this.bcryptAdapter.hushCompare(
      loginDTO.password,
      rawUser[0].hushPass,
    );

    if (!validPassword) {
      return null;
    }

    return rawUser[0].id;
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
