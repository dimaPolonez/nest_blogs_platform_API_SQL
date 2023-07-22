import { CommandBus } from '@nestjs/cqrs';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  JwtAccessGuard,
  QuestJwtAccessGuard,
} from '../../guards-handlers/guard';
import {
  BanUserOfBlogDto,
  CreateBlogDto,
  CreatePostOfBlogDto,
  QueryBlogsDto,
  QueryPostOfBlogDto,
  UpdateBlogDto,
  UpdatePostOfBlogDto,
} from '../../core/dto/blogs';
import {
  GetAllBlogsType,
  GetAllCommentsOfPostType,
  GetAllCommentsToBloggerType,
  GetAllPostsOfBlogType,
  getBanAllUserOfBlogType,
  GetBlogType,
  GetPostOfBlogType,
  MinimalBlog,
} from '../../core/models';
import { BloggerQueryRepository } from './repository/blogger.query-repository';
import {
  BanUserOfBlogCommand,
  CreateBlogToBloggerCommand,
  CreatePostOfBlogToBloggerCommand,
  DeleteBlogToBloggerCommand,
  DeletePostOfBlogToBloggerCommand,
  UpdateBlogToBloggerCommand,
  UpdatePostOfBlogToBloggerCommand,
} from './application/use-cases';
import { QueryCommentDto } from '../../core/dto/posts';
import { Min } from 'class-validator';
import { Type } from 'class-transformer';
import { UserIdPipe } from '../../validation/pipes/userId.pipe';

@Controller('blogger')
export class BloggerController {
  constructor(
    protected commandBus: CommandBus,
    protected bloggerQueryRepository: BloggerQueryRepository,
  ) {}

  @UseGuards(JwtAccessGuard)
  @Get('blogs/comments')
  @HttpCode(HttpStatus.OK)
  async getAllCommentsToBlogger(
    @Request() req,
    @Query() queryAll: QueryCommentDto,
  ): Promise<GetAllCommentsToBloggerType> {
    return await this.bloggerQueryRepository.getAllCommentsToBlogger(
      req.user.userID,
      queryAll,
    );
  }

  @UseGuards(JwtAccessGuard)
  @Put('blogs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') blogID: string,
    @Body() blogDTO: UpdateBlogDto,
    @Request() req,
  ) {
    await this.commandBus.execute(
      new UpdateBlogToBloggerCommand(req.user.userID, blogID, blogDTO),
    );
  }

  @UseGuards(JwtAccessGuard)
  @Delete('blogs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogID: string, @Request() req) {
    await this.commandBus.execute(
      new DeleteBlogToBloggerCommand(req.user.userID, blogID),
    );
  }

  @UseGuards(JwtAccessGuard)
  @Post('blogs')
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Body() blogDTO: CreateBlogDto,
    @Request() req,
  ): Promise<GetBlogType> {
    const newBlogID: string = await this.commandBus.execute(
      new CreateBlogToBloggerCommand(req.user.userID, req.user.login, blogDTO),
    );
    return await this.bloggerQueryRepository.findBlogById(newBlogID);
  }
  @UseGuards(JwtAccessGuard)
  @Get('blogs')
  @HttpCode(HttpStatus.OK)
  async getAllBlogsToBlogger(
    @Query() queryAll: QueryBlogsDto,
    @Request() req,
  ): Promise<GetAllBlogsType> {
    return await this.bloggerQueryRepository.getAllBlogsToBlogger(
      req.user.userID,
      queryAll,
    );
  }

  @UseGuards(JwtAccessGuard)
  @Post('blogs/:id/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostOfBlog(
    @Param('id') blogID: string,
    @Body() postDTO: CreatePostOfBlogDto,
    @Request() req,
  ): Promise<GetPostOfBlogType> {
    const newPostOfBlogID: string = await this.commandBus.execute(
      new CreatePostOfBlogToBloggerCommand(req.user.userID, blogID, postDTO),
    );

    return await this.bloggerQueryRepository.findPostById(newPostOfBlogID);
  }

  @UseGuards(JwtAccessGuard)
  @Get('blogs/:id/posts')
  @HttpCode(HttpStatus.OK)
  async getAllPostsOfBlogToBlogger(
    @Request() req,
    @Param('id') blogID: string,
    @Query() queryAll: QueryPostOfBlogDto,
  ): Promise<GetAllPostsOfBlogType> {
    return await this.bloggerQueryRepository.getAllPostsOfBlogToBlogger(
      req.user.userID,
      queryAll,
      blogID,
    );
  }

  @UseGuards(JwtAccessGuard)
  @Put('blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostOfBlog(
    @Param('blogId') blogID: string,
    @Param('postId') postID: string,
    @Body() postDTO: UpdatePostOfBlogDto,
    @Request() req,
  ) {
    await this.commandBus.execute(
      new UpdatePostOfBlogToBloggerCommand(
        req.user.userID,
        blogID,
        postID,
        postDTO,
      ),
    );
  }

  @UseGuards(JwtAccessGuard)
  @Delete('blogs/:blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostOfBlog(
    @Param('blogId') blogID: string,
    @Param('postId') postID: string,
    @Request() req,
  ) {
    await this.commandBus.execute(
      new DeletePostOfBlogToBloggerCommand(req.user.userID, blogID, postID),
    );
  }
  @UseGuards(JwtAccessGuard)
  @Put('users/:id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUserOfBlog(
    @Body() banUserOfBlogDTO: BanUserOfBlogDto,
    @Param('id') userID: string,
    @Request() req,
  ) {
    await this.commandBus.execute(
      new BanUserOfBlogCommand(req.user.userID, banUserOfBlogDTO, userID),
    );
  }
  @UseGuards(JwtAccessGuard)
  @Get('users/blog/:id')
  @HttpCode(HttpStatus.OK)
  async getBanAllUserOfBlog(
    @Param('id') blogID: string,
    @Query() queryAll: QueryBlogsDto,
    @Request() req,
  ): Promise<getBanAllUserOfBlogType> {
    return await this.bloggerQueryRepository.getBanAllUserOfBlog(
      req.user.userID,
      blogID,
      queryAll,
    );
  }
}
