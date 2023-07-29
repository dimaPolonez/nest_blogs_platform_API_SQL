import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtRefreshGuard } from '../guards-handlers/guard';
import { GetSessionUserType } from '../core/models';
import {
  DeleteOneSessionCommand,
  GetAllSessionCommand,
} from './application/use-cases';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteAllSessionsCommand } from './application/use-cases/delete-all-sessions-use-case';

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
      new DeleteAllSessionsCommand(req.user.userID, req.user.deviceId),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshGuard)
  @Delete('devices/:id')
  async deleteUserOneSession(
    @Request() req,
    @Param('id', new ParseUUIDPipe()) deviceID: string,
  ) {
    await this.commandBus.execute(
      new DeleteOneSessionCommand(req.user.userID, deviceID),
    );
  }
}
