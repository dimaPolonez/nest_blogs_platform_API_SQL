import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtRefreshGuard } from '../guards-handlers/guard';
import { GetSessionUserType } from '../core/models';
import {
  DeleteActiveSessionCommand,
  DeleteAllSessionCommand,
  GetAllSessionCommand,
} from './application/use-cases';
import { CommandBus } from '@nestjs/cqrs';

@Controller('security')
export class SessionsController {
  constructor(protected commandBus: CommandBus) {}
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @Get('devices')
  async getUserAllSession(@Request() req): Promise<GetSessionUserType[]> {
    return await this.commandBus.execute(
      new GetAllSessionCommand(req.user.userID),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshGuard)
  @Delete('devices')
  async deleteUserAllSession(@Request() req) {
    return await this.commandBus.execute(
      new DeleteAllSessionCommand(req.user.userID, req.user.deviceId),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshGuard)
  @Delete('devices/:id')
  async deleteUserOneSession(@Request() req, @Param('id') deviceID: string) {
    await this.commandBus.execute(
      new DeleteActiveSessionCommand(req.user.userID, deviceID),
    );
  }
}
