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
import { BasicAuthGuard } from '../../guards-handlers/guard';
import { SuperAdminController } from './super-admin.controller';
import {
  BanBlogUseCase,
  BanUserUseCase,
  BindBlogUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
} from './application/use-cases';
import { SuperAdminRepository } from './repository/super-admin.repository';
import { SuperAdminQueryRepository } from './repository/super-admin.query-repository';
import { BlogIdPipe } from '../../validation/pipes/blogId.pipe';
import { UserIdPipe } from '../../validation/pipes/userId.pipe';
import { BlogsModule } from '../../public/blogs/blogs.module';
import { BcryptAdapter } from '../../adapters';
import { SuperAdminService } from './application/super-admin.service';
import { AuthModule } from '../../auth/auth.module';

const modules = [CqrsModule, AuthModule, BlogsModule];

const pipes = [BlogIdPipe, UserIdPipe];

const adapters = [BcryptAdapter];

const useCases = [
  BindBlogUseCase,
  BanUserUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  BanBlogUseCase,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlogModel.name, schema: BlogModelSchema },
      { name: PostModel.name, schema: PostModelSchema },
      { name: UserModel.name, schema: UserModelSchema },
      { name: CommentModel.name, schema: CommentModelSchema },
    ]),
    ...modules,
  ],
  controllers: [SuperAdminController],
  providers: [
    SuperAdminRepository,
    SuperAdminQueryRepository,
    SuperAdminService,
    ...pipes,
    ...adapters,
    ...useCases,
  ],
  exports: [SuperAdminService],
})
export class SuperAdminModule {}
