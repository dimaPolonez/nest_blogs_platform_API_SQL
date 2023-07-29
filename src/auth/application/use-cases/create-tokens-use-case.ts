import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../repository/auth.repository';
import {
  AuthObjectType,
  SessionsUsersInfoType,
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
    protected jwtService: JwtService,
  ) {}
  async execute(command: CreateTokensCommand): Promise<TokensObjectType> {
    const { authObject } = command;

    const expiresTime: string = add(new Date(), {
      seconds: CONFIG.EXPIRES_REFRESH,
    }).toString();

    const rawSession: SessionsUsersInfoType[] =
      await this.authRepository.addNewDevice(authObject, expiresTime);

    const refreshToken: string = this.jwtService.sign(
      { deviceId: rawSession[0].id, userID: rawSession[0].userId },
      { secret: CONFIG.JWT_REFRESH_SECRET, expiresIn: CONFIG.EXPIRES_REFRESH },
    );

    const accessToken: string = this.jwtService.sign(
      { userID: rawSession[0].userId },
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
