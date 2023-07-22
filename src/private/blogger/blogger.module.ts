import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BlogModel,
  BlogModelSchema,
  CommentModel,
  CommentModelSchema,
  PostModel,
  PostModelSchema,
  UserModel,
  UserModelSchema,
} from '../../core/entity';
import { BloggerController } from './blogger.controller';
import { BloggerRepository } from './repository/blogger.repository';
import { BloggerQueryRepository } from './repository/blogger.query-repository';
import {
  BanUserOfBlogUseCase,
  CreateBlogToBloggerUseCase,
  CreatePostOfBlogToBloggerUseCase,
  DeleteBlogToBloggerUseCase,
  DeletePostOfBlogToBloggerUseCase,
  UpdateBlogToBloggerUseCase,
  UpdatePostOfBlogToBloggerUseCase,
} from './application/use-cases';
import { AuthModule } from '../../auth/auth.module';
import { UserIdPipe } from '../../validation/pipes/userId.pipe';

const modules = [CqrsModule, AuthModule];

const useCases = [
  CreateBlogToBloggerUseCase,
  UpdateBlogToBloggerUseCase,
  DeleteBlogToBloggerUseCase,
  CreatePostOfBlogToBloggerUseCase,
  UpdatePostOfBlogToBloggerUseCase,
  DeletePostOfBlogToBloggerUseCase,
  BanUserOfBlogUseCase,
];
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlogModel.name, schema: BlogModelSchema },
      { name: PostModel.name, schema: PostModelSchema },
      { name: CommentModel.name, schema: CommentModelSchema },
    ]),
    ...modules,
  ],
  controllers: [BloggerController],
  providers: [BloggerRepository, BloggerQueryRepository, ...useCases],
})
export class BloggerModule {}
