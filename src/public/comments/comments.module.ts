import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsRepository } from './repository/comments.repository';
import { CommentsQueryRepository } from './repository/comments.query-repository';
import { CqrsModule } from '@nestjs/cqrs';
import {
  DeleteCommentUseCase,
  UpdateCommentUseCase,
  UpdateLikeStatusCommentUseCase,
} from './application/use-cases';
import { AuthModule } from '../../auth/auth.module';

const modules = [CqrsModule, AuthModule];

const useCases = [
  UpdateLikeStatusCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
];

@Module({
  imports: [...modules],
  controllers: [CommentsController],
  providers: [CommentsRepository, CommentsQueryRepository, ...useCases],
})
export class CommentsModule {}
