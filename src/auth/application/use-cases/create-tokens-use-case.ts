import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ActiveCodeAdapter } from '../../../adapters';
import { AuthRepository } from '../../repository/auth.repository';
import { UserModelType } from '../../../core/entity';
import {
  AuthObjectType,
  SessionUserDTOType,
  SessionUserType,
  TokensObjectType,
} from '../../../core/models';
import { add } from 'date-fns';
import { CONFIG } from '../../../config/config';
import { JwtService } from '@nestjs/jwt';

export class CreateTokensCommand {
  constructor(public readonly authObject: AuthObjectType) {}
}

@CommandHandler(CreateTokensCommand)
export class CreateTokensUseCase
  implements ICommandHandler<CreateTokensCommand>
{
  constructor(
    protected authRepository: AuthRepository,
    protected activeCodeAdapter: ActiveCodeAdapter,
    protected jwtService: JwtService,
  ) {}
  async addNewDevice(sessionUserDTO: SessionUserDTOType): Promise<string> {
    const deviceId: string = await this.activeCodeAdapter.generateId();

    const newSessionUserDTO: SessionUserType = {
      deviceId,
      ip: sessionUserDTO.ip,
      lastActiveDate: sessionUserDTO.lastActiveDate,
      title: sessionUserDTO.nameDevice,
      expiresTime: sessionUserDTO.expiresTime,
    };

    const findUser: UserModelType = await this.authRepository.findUserById(
      sessionUserDTO.userID,
    );

    findUser.sessionsUser.push(newSessionUserDTO);

    await this.authRepository.save(findUser);

    return deviceId;
  }
  async execute(command: CreateTokensCommand): Promise<TokensObjectType> {
    const { authObject } = command;

    const lastActiveDate: string = new Date().toISOString();

    const expiresTime: string = add(new Date(), {
      seconds: CONFIG.EXPIRES_REFRESH,
    }).toString();

    const deviceID: string = await this.addNewDevice({
      ...authObject,
      expiresTime: expiresTime,
      lastActiveDate: lastActiveDate,
    });

    const refreshToken: string = this.jwtService.sign(
      { deviceId: deviceID, userID: authObject.userID },
      { secret: CONFIG.JWT_REFRESH_SECRET, expiresIn: CONFIG.EXPIRES_REFRESH },
    );

    const accessToken: string = this.jwtService.sign(
      { userID: authObject.userID },
      { secret: CONFIG.JWT_ACCESS_SECRET, expiresIn: CONFIG.EXPIRES_ACCESS },
    );

    return {
      refreshToken: refreshToken,
      accessDTO: {
        accessToken: accessToken,
      },
      optionsCookie: {
        httpOnly: true,
        secure: true,
      },
    };
  }
}
