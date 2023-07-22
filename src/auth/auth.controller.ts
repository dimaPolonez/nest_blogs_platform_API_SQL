import {
  Body,
  Controller,
  Headers,
  Get,
  Ip,
  Post,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  CreateUserMailDto,
  CodeConfirmDto,
  EmailRecPassDto,
  NewPassDto,
  EmailResendDto,
} from '../core/dto/auth';
import {
  JwtAccessGuard,
  JwtRefreshGuard,
  LocalAuthGuard,
} from '../guards-handlers/guard';
import { Response } from 'express';
import {
  AboutMeType,
  AuthObjectType,
  AuthObjectUpdateType,
  TokensObjectType,
} from '../core/models';
import { CommandBus } from '@nestjs/cqrs';
import {
  ConfirmEmailCommand,
  CreateNewPasswordCommand,
  CreateTokensCommand,
  DeleteActiveSessionCommand,
  EmailResendingCommand,
  GetUserInfCommand,
  PasswordRecoveryCommand,
  RegistrationUserCommand,
  UpdateTokensCommand,
} from './application/use-cases';

@Controller('auth')
export class AuthController {
  constructor(protected commandBus: CommandBus) {}

  //@UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('password-recovery')
  async userCreateNewPass(@Body() userEmailDTO: EmailRecPassDto) {
    await this.commandBus.execute(
      new PasswordRecoveryCommand(userEmailDTO.email),
    );
  }

  //@UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  async userUpdateNewPass(@Body() newPassDTO: NewPassDto) {
    await this.commandBus.execute(new CreateNewPasswordCommand(newPassDTO));
  }

  @UseGuards(/*ThrottlerGuard,*/ LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async userAuthorization(
    @Request()
    req,
    @Ip() userIP: string,
    @Headers('user-agent') nameDevice: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authObjectDTO: AuthObjectType = {
      ip: userIP,
      nameDevice: nameDevice,
      userID: req.user,
    };

    const tokensObject: TokensObjectType = await this.commandBus.execute(
      new CreateTokensCommand(authObjectDTO),
    );
    response.cookie(
      'refreshToken',
      tokensObject.refreshToken,
      tokensObject.optionsCookie,
    );

    return tokensObject.accessDTO;
  }

  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async userRefreshToken(
    @Request() req,
    @Ip() userIP: string,
    @Headers('user-agent') nameDevice: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authObjectDTO: AuthObjectUpdateType = {
      ip: userIP,
      nameDevice: nameDevice,
      userID: req.user.userID,
      deviceID: req.user.deviceId,
    };

    const tokensObject: TokensObjectType = await this.commandBus.execute(
      new UpdateTokensCommand(authObjectDTO),
    );

    response.cookie(
      'refreshToken',
      tokensObject.refreshToken,
      tokensObject.optionsCookie,
    );

    return tokensObject.accessDTO;
  }

  //@UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async userRegistrationConfirm(@Body() codeConfirm: CodeConfirmDto) {
    await this.commandBus.execute(new ConfirmEmailCommand(codeConfirm.code));
  }

  //@UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async userRegistration(@Body() userRegDTO: CreateUserMailDto) {
    await this.commandBus.execute(new RegistrationUserCommand(userRegDTO));
  }

  //@UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  async userRegistrationResending(@Body() userEmailDTO: EmailResendDto) {
    await this.commandBus.execute(
      new EmailResendingCommand(userEmailDTO.email),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async userLogout(
    @Request() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.commandBus.execute(
      new DeleteActiveSessionCommand(req.user.userID, req.user.deviceId),
    );

    await response.clearCookie('refreshToken');
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessGuard)
  @Get('me')
  async getUserInf(@Request() req): Promise<AboutMeType> {
    return await this.commandBus.execute(
      new GetUserInfCommand(req.user.userID),
    );
  }
}
