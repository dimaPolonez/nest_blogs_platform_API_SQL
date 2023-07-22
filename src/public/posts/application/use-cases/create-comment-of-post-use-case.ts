import {
  CreateCommentOfPostType,
  GetCommentOfPostType,
  NewCommentObjectType,
} from '../../../../core/models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../repository/posts.repository';
import {
  CommentModel,
  CommentModelType,
  PostModelType,
} from '../../../../core/entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostsQueryRepository } from '../../repository/posts.query-repository';
import { AuthService } from '../../../../auth/application/auth.service';

export class CreateCommentOfPostCommand {
  constructor(
    public readonly postID: string,
    public readonly commentDTO: CreateCommentOfPostType,
    public readonly userID: string,
    public readonly login: string,
  ) {}
}

@CommandHandler(CreateCommentOfPostCommand)
export class CreateCommentOfPostUseCase
  implements ICommandHandler<CreateCommentOfPostCommand>
{
  constructor(
    @InjectModel(CommentModel.name)
    private readonly CommentModel: Model<CommentModelType>,
    protected postRepository: PostsRepository,
    protected postQueryRepository: PostsQueryRepository,
    protected authService: AuthService,
  ) {}

  async execute(
    command: CreateCommentOfPostCommand,
  ): Promise<GetCommentOfPostType> {
    const { postID, commentDTO, userID, login } = command;

    const findPost: PostModelType = await this.postRepository.findPostById(
      postID,
    );

    if (!findPost) {
      throw new NotFoundException('post not found');
    }

    const userBlockedToBlog: boolean = await this.authService.userBlockedToBlog(
      userID,
      findPost.blogId,
    );

    if (userBlockedToBlog) {
      throw new ForbiddenException();
    }

    const newCommentDTO: NewCommentObjectType = {
      content: commentDTO.content,
      commentatorInfo: {
        userId: userID,
        userLogin: login,
      },
      postId: postID,
    };

    const createCommentSmart: CommentModelType = await new this.CommentModel(
      newCommentDTO,
    );

    await this.postRepository.save(createCommentSmart);

    return this.postQueryRepository.getCommentOfPost(createCommentSmart.id);
  }
}
