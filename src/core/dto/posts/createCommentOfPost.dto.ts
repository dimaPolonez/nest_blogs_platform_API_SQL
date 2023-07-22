import { IsNotEmpty, Length } from 'class-validator';
import { CreateCommentOfPostType } from '../../models';
import { TrimDecorator } from '../../../validation/decorators/trim.decorator';

export class CreateCommentOfPostDto implements CreateCommentOfPostType {
  @TrimDecorator()
  @Length(20, 300)
  @IsNotEmpty()
  readonly content: string;
}
