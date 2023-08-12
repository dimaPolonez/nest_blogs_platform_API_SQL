import { Module } from '@nestjs/common';
import { PostsModule } from '../posts/posts.module';
import { BlogsQueryRepository } from './blogs.query-repository';
import { BlogsController } from './blogs.controller';
import { AuthModule } from '../../auth/auth.module';

const modules = [AuthModule, PostsModule];

@Module({
  imports: [...modules],
  controllers: [BlogsController],
  providers: [BlogsQueryRepository],
})
export class BlogsModule {}
