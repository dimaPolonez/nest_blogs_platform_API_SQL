import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from './repository/comments.query-repository';
import {
  UpdateCommentDto,
  UpdateLikeStatusCommentDto,
} from '../../core/dto/comments';
import {
  JwtAccessGuard,
  QuestJwtAccessGuard,
} from '../../guards-handlers/guard';
import { GetCommentType } from '../../core/models';
import { CommandBus } from '@nestjs/cqrs';
import {
  DeleteCommentCommand,
  UpdateCommentCommand,
  UpdateLikeStatusCommentCommand,
} from './application/use-cases';

@Controller('comments')
export class CommentsController {
  constructor(
    protected commandBus: CommandBus,
    protected commentQueryRepository: CommentsQueryRepository,
  ) {}

  @UseGuards(JwtAccessGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatusComment(
    @Request() req,
    @Param('id') commentID: string,
    @Body() bodyLikeStatus: UpdateLikeStatusCommentDto,
  ) {
    await this.commandBus.execute(
      new UpdateLikeStatusCommentCommand(
        req.user.userID,
        req.user.login,
        commentID,
        bodyLikeStatus.likeStatus,
      ),
    );
  }

  @UseGuards(JwtAccessGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Request() req,
    @Param('id') commentID: string,
    @Body() commentDTO: UpdateCommentDto,
  ) {
    await this.commandBus.execute(
      new UpdateCommentCommand(req.user.userID, commentID, commentDTO),
    );
  }

  @UseGuards(JwtAccessGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Request() req, @Param('id') commentID: string) {
    await this.commandBus.execute(
      new DeleteCommentCommand(req.user.userID, commentID),
    );
  }

  @UseGuards(QuestJwtAccessGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneComment(
    @Request() req,
    @Param('id') commentID: string,
  ): Promise<GetCommentType> {
    return await this.commentQueryRepository.findCommentById(
      commentID,
      req.user.userID,
    );
  }
}
