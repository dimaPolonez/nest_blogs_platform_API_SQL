import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BlogModel,
  BlogModelType,
  UserModel,
  UserModelType,
} from '../../core/entity';
import {
  AuthObjectType,
  ConfirmUserType,
  SessionsUsersInfoType,
  SessionUserType,
  TablesNames,
  UserRegistrationDTO,
  UsersTableType,
} from '../../core/models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
    @InjectModel(UserModel.name)
    private readonly UserModel: Model<UserModelType>,
    @InjectModel(BlogModel.name)
    private readonly BlogModel: Model<BlogModelType>,
  ) {}

  async recoveryCode(
    authParams: ConfirmUserType,
    email: string,
  ): Promise<number> {
    const text = `UPDATE "${TablesNames.Users}" SET "userIsConfirmed" = $1, 
                  "codeActivated" = $2, "codeActivatedExpired" = $3 WHERE "email" = $4`;
    const values = [
      authParams.confirm,
      authParams.codeActivated,
      authParams.lifeTimeCode,
      email,
    ];

    const result = await this.dataSource.query(text, values);

    return result[1];
  }

  async updateActivateUserAndPassword(
    recoveryCode: string,
    newPass: string,
  ): Promise<number> {
    const text = `UPDATE "${TablesNames.Users}" SET "userIsConfirmed" = true,
                  "codeActivated" = null, "codeActivatedExpired" = null, 
                  "hushPass" = $1 WHERE "codeActivated" = $2`;

    const values = [newPass, recoveryCode];

    const result = await this.dataSource.query(text, values);

    return result[1];
  }

  async updateActivateUser(recoveryCode: string): Promise<number> {
    const text = `UPDATE "${TablesNames.Users}" SET "userIsConfirmed" = true,
                  "codeActivated" = null, "codeActivatedExpired" = null 
                  WHERE "codeActivated" = $1`;

    const values = [recoveryCode];

    const result = await this.dataSource.query(text, values);

    return result[1];
  }

  async addNewDevice(
    authObject: AuthObjectType,
    expiresTime: string,
  ): Promise<SessionsUsersInfoType[]> {
    const text = `INSERT INTO "${TablesNames.SessionsUsersInfo}"("userId", "ip",
                  "title", "sessionExpired") VALUES($1, $2, $3, $4) RETURNING *`;
    const values = [
      authObject.userID,
      authObject.ip,
      authObject.nameDevice,
      expiresTime,
    ];

    return await this.dataSource.query(text, values);
  }

  async userRegistration(
    newUserDTO: UserRegistrationDTO,
  ): Promise<UsersTableType[]> {
    const text = `INSERT INTO "${TablesNames.Users}"(login, "hushPass", email, 
                  "userIsConfirmed", "codeActivated", "codeActivatedExpired") 
                  VALUES($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [
      newUserDTO.login,
      newUserDTO.hushPass,
      newUserDTO.email,
      newUserDTO.confirm,
      newUserDTO.codeActivated,
      newUserDTO.lifeTimeCode,
    ];

    return await this.dataSource.query(text, values);
  }

  async findUser(userID: string): Promise<UsersTableType[]> {
    const text = `SELECT * FROM "${TablesNames.Users}" WHERE "id" = $1`;

    const values = [userID];

    return await this.dataSource.query(text, values);
  }

  async findUserEmailOrLogin(loginOrEmail: string): Promise<UsersTableType[]> {
    const text = `SELECT * FROM "${TablesNames.Users}" WHERE "login" = $1 
                  OR "email" = $1`;

    const values = [loginOrEmail];

    return await this.dataSource.query(text, values);
  }

  async updateDevice(deviceID: string, expiresTime: string): Promise<number> {
    const text = `UPDATE "${TablesNames.SessionsUsersInfo}" SET "sessionExpired" = $1,
                  "lastActiveDate" = NOW() WHERE "id" = $2`;

    const values = [expiresTime, deviceID];

    const result = await this.dataSource.query(text, values);

    return result[1];
  }

  async findSession(deviceID: string): Promise<SessionsUsersInfoType[]> {
    const text = `SELECT * FROM "${TablesNames.SessionsUsersInfo}" WHERE "id" = $1`;

    const values = [deviceID];

    return await this.dataSource.query(text, values);
  }

  async findUserSessions(userID: string): Promise<SessionsUsersInfoType[]> {
    const text = `SELECT * FROM "${TablesNames.SessionsUsersInfo}" WHERE "userId" = $1`;

    const values = [userID];

    return await this.dataSource.query(text, values);
  }

  async logoutUser(userID: string, deviceID: string) {
    const text = `DELETE FROM "${TablesNames.SessionsUsersInfo}" WHERE "userId" = $1 
    AND "id" <> $2`;

    const values = [userID, deviceID];

    const result = await this.dataSource.query(text, values);

    return result[1];
  }

  async deleteOneSession(userID: string, deviceID: string) {
    const text = `DELETE FROM "${TablesNames.SessionsUsersInfo}" WHERE "userId" = $1 
    AND "id" = $2;`;

    const values = [userID, deviceID];

    const result = await this.dataSource.query(text, values);

    return result[1];
  }

  async userBlockedToBlog(userID: string, blogID: string) {
    return this.BlogModel.findById({
      _id: blogID,
    });
  }

  async findUserById(userID: string): Promise<UserModelType | null> {
    return this.UserModel.findById({ _id: userID });
  }

  async findUserByCode(code: string): Promise<UsersTableType[]> {
    const text = `SELECT * FROM "${TablesNames.Users}" WHERE "codeActivated" = $1`;

    const values = [code];

    return await this.dataSource.query(text, values);
  }
  async checkedEmail(email: string): Promise<UsersTableType[]> {
    const text = `SELECT * FROM "${TablesNames.Users}" WHERE "email" = $1`;

    const values = [email];

    return await this.dataSource.query(text, values);
  }

  async checkedUniqueLogin(login: string): Promise<UsersTableType[]> {
    const text = `SELECT * FROM "${TablesNames.Users}" WHERE "login" = $1`;

    const values = [login];

    return await this.dataSource.query(text, values);
  }

  async save(model: UserModelType) {
    return await model.save();
  }
}
