import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from './blogs.query-repository';
import { QueryBlogsDto, QueryPostOfBlogDto } from '../../core/dto/blogs';
import { QuestJwtAccessGuard } from '../../guards-handlers/guard';
import {
  GetAllBlogsType,
  GetAllPostsOfBlogType,
  GetBlogType,
} from '../../core/models';

@Controller('blogs')
export class BlogsController {
  constructor(protected blogQueryRepository: BlogsQueryRepository) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllBlogs(
    @Query() queryAll: QueryBlogsDto,
  ): Promise<GetAllBlogsType> {
    return await this.blogQueryRepository.getAllBlogs(queryAll);
  }

  @UseGuards(QuestJwtAccessGuard)
  @Get(':id/posts')
  @HttpCode(HttpStatus.OK)
  async getAllPostsOfBlog(
    @Request() req,
    @Param('id', new ParseUUIDPipe()) blogID: string,
    @Query() queryAll: QueryPostOfBlogDto,
  ): Promise<GetAllPostsOfBlogType> {
    return await this.blogQueryRepository.getAllPostsToBlog(
      req.user.userID,
      queryAll,
      blogID,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOneBlog(
    @Param('id', new ParseUUIDPipe()) blogID: string,
  ): Promise<GetBlogType> {
    return await this.blogQueryRepository.findBlogById(blogID);
  }
}
