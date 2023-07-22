import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsController } from './comments.controller';
import { CommentsRepository } from './repository/comments.repository';
import { CommentsQueryRepository } from './repository/comments.query-repository';
import { CommentModel, CommentModelSchema } from '../../core/entity';
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
  imports: [
    MongooseModule.forFeature([
      { name: CommentModel.name, schema: CommentModelSchema },
    ]),
    ...modules,
  ],
  controllers: [CommentsController],
  providers: [CommentsRepository, CommentsQueryRepository, ...useCases],
})
export class CommentsModule {}
