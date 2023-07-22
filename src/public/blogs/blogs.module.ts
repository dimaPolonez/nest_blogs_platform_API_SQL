import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogModel, BlogModelSchema } from '../../core/entity';
import { PostsModule } from '../posts/posts.module';
import { BlogsQueryRepository } from './blogs.query-repository';
import { BlogsController } from './blogs.controller';
import { AuthModule } from '../../auth/auth.module';

const modules = [AuthModule, PostsModule];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlogModel.name, schema: BlogModelSchema },
    ]),
    ...modules,
  ],
  controllers: [BlogsController],
  providers: [BlogsQueryRepository],
})
export class BlogsModule {}
