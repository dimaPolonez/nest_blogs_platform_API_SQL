import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostsQueryRepository } from './repository/posts.query-repository';
import {
  CreateCommentOfPostDto,
  QueryPostDto,
  QueryCommentDto,
  UpdateLikeStatusPostDto,
} from '../../core/dto/posts';
import {
  JwtAccessGuard,
  QuestJwtAccessGuard,
} from '../../guards-handlers/guard';
import {
  GetAllCommentsOfPostType,
  GetAllPostsType,
  GetCommentOfPostType,
  GetPostType,
} from '../../core/models';
import {
  CreateCommentOfPostCommand,
  UpdateLikeStatusPostCommand,
} from './application/use-cases';
import { CommandBus } from '@nestjs/cqrs';

@Controller('posts')
export class PostsController {
  constructor(
    protected commandBus: CommandBus,
    protected postQueryRepository: PostsQueryRepository,
  ) {}

  @UseGuards(JwtAccessGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeStatusPost(
    @Request() req,
    @Param('id') postID: string,
    @Body() bodyLikeStatus: UpdateLikeStatusPostDto,
  ) {
    await this.commandBus.execute(
      new UpdateLikeStatusPostCommand(
        req.user.userID,
        req.user.login,
        postID,
        bodyLikeStatus.likeStatus,
      ),
    );
  }

  @UseGuards(QuestJwtAccessGuard)
  @Get(':id/comments')
  @HttpCode(HttpStatus.OK)
  async getAllCommentsOfPost(
    @Request() req,
    @Param('id') postID: string,
    @Query() queryAll: QueryCommentDto,
  ): Promise<GetAllCommentsOfPostType> {
    return await this.postQueryRepository.getAllCommentsOfPost(
      req.user.userID,
      postID,
      queryAll,
    );
  }

  @UseGuards(JwtAccessGuard)
  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  async createCommentOfPost(
    @Request() req,
    @Param('id') postID: string,
    @Body() commentDTO: CreateCommentOfPostDto,
  ): Promise<GetCommentOfPostType> {
    return await this.commandBus.execute(
      new CreateCommentOfPostCommand(
        postID,
        commentDTO,
        req.user.userID,
        req.user.login,
      ),
    );
  }

  @UseGuards(QuestJwtAccessGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllPosts(
    @Request() req,
    @Query() queryAll: QueryPostDto,
  ): Promise<GetAllPostsType> {
    return await this.postQueryRepository.getAllPosts(
      req.user.userID,
      queryAll,
    );
  }

  @UseGuards(QuestJwtAccessGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOnePost(
    @Request() req,
    @Param('id') postID: string,
  ): Promise<GetPostType> {
    return await this.postQueryRepository.findPostById(postID, req.user.userID);
  }
}
