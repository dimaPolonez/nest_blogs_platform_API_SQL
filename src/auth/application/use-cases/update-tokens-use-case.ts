import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRepository } from '../../repository/auth.repository';
import { AuthObjectUpdateType, TokensObjectType } from '../../../core/models';
import { add } from 'date-fns';
import { CONFIG } from '../../../config/config';
import { JwtService } from '@nestjs/jwt';

export class UpdateTokensCommand {
  constructor(public readonly authObject: AuthObjectUpdateType) {}
}

@CommandHandler(UpdateTokensCommand)
export class UpdateTokensUseCase
  implements ICommandHandler<UpdateTokensCommand>
{
  constructor(
    protected authRepository: AuthRepository,
    protected jwtService: JwtService,
  ) {}
  async execute(command: UpdateTokensCommand): Promise<TokensObjectType> {
    const { authObject } = command;

    const lastActiveDate: string = new Date().toISOString();

    const expiresTime: string = add(new Date(), {
      seconds: CONFIG.EXPIRES_REFRESH,
    }).toString();

    await this.authRepository.updateDevice({
      deviceID: authObject.deviceID,
      expiresTime: expiresTime,
      lastActiveDate: lastActiveDate,
    });

    const refreshToken: string = this.jwtService.sign(
      { deviceId: authObject.deviceID, userID: authObject.userID },
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
