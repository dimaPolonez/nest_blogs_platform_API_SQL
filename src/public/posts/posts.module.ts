import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsRepository } from './repository/posts.repository';
import { PostsQueryRepository } from './repository/posts.query-repository';
import { CqrsModule } from '@nestjs/cqrs';
import {
  CreateCommentOfPostUseCase,
  UpdateLikeStatusPostUseCase,
} from './application/use-cases';
import { AuthModule } from '../../auth/auth.module';

const modules = [CqrsModule, AuthModule];

const useCases = [UpdateLikeStatusPostUseCase, CreateCommentOfPostUseCase];

@Module({
  imports: [...modules],
  controllers: [PostsController],
  providers: [PostsRepository, PostsQueryRepository, ...useCases],
  exports: [PostsQueryRepository],
})
export class PostsModule {}
