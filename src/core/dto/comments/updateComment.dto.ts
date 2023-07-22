import { IsNotEmpty, Length } from 'class-validator';
import { UpdateCommentType } from '../../models';
import { TrimDecorator } from '../../../validation/decorators/trim.decorator';

export class UpdateCommentDto implements UpdateCommentType {
  @TrimDecorator()
  @Length(20, 300)
  @IsNotEmpty()
  readonly content: string;
}
