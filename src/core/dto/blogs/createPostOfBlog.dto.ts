import { IsNotEmpty, Length } from 'class-validator';
import { CreatePostOfBlogType } from '../../models';
import { TrimDecorator } from '../../../validation/decorators/trim.decorator';

export class CreatePostOfBlogDto implements CreatePostOfBlogType {
  @TrimDecorator()
  @Length(1, 30)
  @IsNotEmpty()
  readonly title: string;

  @TrimDecorator()
  @Length(1, 100)
  @IsNotEmpty()
  readonly shortDescription: string;

  @TrimDecorator()
  @Length(1, 1000)
  @IsNotEmpty()
  readonly content: string;
}
