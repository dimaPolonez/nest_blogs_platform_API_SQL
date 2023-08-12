import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
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
import { BlogsModule } from '../../public/blogs/blogs.module';
import { BcryptAdapter } from '../../adapters';
import { SuperAdminService } from './application/super-admin.service';
import { AuthModule } from '../../auth/auth.module';

const modules = [CqrsModule, AuthModule, BlogsModule];

const adapters = [BcryptAdapter];

const useCases = [
  BindBlogUseCase,
  BanUserUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  BanBlogUseCase,
];

@Module({
  imports: [...modules],
  controllers: [SuperAdminController],
  providers: [
    SuperAdminRepository,
    SuperAdminQueryRepository,
    SuperAdminService,
    ...adapters,
    ...useCases,
  ],
  exports: [SuperAdminService],
})
export class SuperAdminModule {}
