import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './posts.controller';
import { PostsRepository } from './repository/posts.repository';
import { PostsQueryRepository } from './repository/posts.query-repository';
import {
  CommentModel,
  CommentModelSchema,
  PostModel,
  PostModelSchema,
} from '../../core/entity';
import { CqrsModule } from '@nestjs/cqrs';
import {
  CreateCommentOfPostUseCase,
  UpdateLikeStatusPostUseCase,
} from './application/use-cases';
import { AuthModule } from '../../auth/auth.module';

const modules = [CqrsModule, AuthModule];

const useCases = [UpdateLikeStatusPostUseCase, CreateCommentOfPostUseCase];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostModel.name, schema: PostModelSchema },
      { name: CommentModel.name, schema: CommentModelSchema },
    ]),
    ...modules,
  ],
  controllers: [PostsController],
  providers: [PostsRepository, PostsQueryRepository, ...useCases],
  exports: [PostsQueryRepository],
})
export class PostsModule {}
