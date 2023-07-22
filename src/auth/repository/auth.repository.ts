import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BlogModel,
  BlogModelType,
  UserModel,
  UserModelType,
} from '../../core/entity';
import { SessionUserType, SessionUserUpdateDTOType } from '../../core/models';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(UserModel.name)
    private readonly UserModel: Model<UserModelType>,
    @InjectModel(BlogModel.name)
    private readonly BlogModel: Model<BlogModelType>,
  ) {}

  async userBlockedToBlog(userID: string, blogID: string) {
    return this.BlogModel.findById({
      _id: blogID,
    });
  }

  async findUserById(userID: string): Promise<UserModelType | null> {
    return this.UserModel.findById({ _id: userID });
  }

  async updateDevice(sessionUserDTO: SessionUserUpdateDTOType) {
    await this.UserModel.updateOne(
      { 'sessionsUser.deviceId': sessionUserDTO.deviceID },
      {
        $set: {
          'sessionsUser.$.expiresTime': sessionUserDTO.expiresTime,
          'sessionsUser.$.lastActiveDate': sessionUserDTO.lastActiveDate,
        },
      },
    );
  }

  async findUserSession(sessionID: string): Promise<SessionUserType | null> {
    return this.UserModel.findOne({ 'sessionsUser.deviceId': sessionID });
  }

  async findUserByCode(code: string): Promise<UserModelType | null> {
    return this.UserModel.findOne({
      'activateUser.codeActivated': code,
    });
  }
  async checkedEmail(email: string): Promise<UserModelType | null> {
    return this.UserModel.findOne({ email: email });
  }

  async checkedUniqueLogin(login: string): Promise<UserModelType | null> {
    return this.UserModel.findOne({ login: login });
  }

  async findUserByEmailOrLogin(
    loginOrEmail: string,
  ): Promise<UserModelType | null> {
    return this.UserModel.findOne({
      $or: [
        {
          login: loginOrEmail,
        },
        { email: loginOrEmail },
      ],
    });
  }

  async findUserEmailToBase(email: string): Promise<UserModelType | null> {
    return this.UserModel.findOne({ email: email });
  }

  async save(model: UserModelType) {
    return await model.save();
  }
}
