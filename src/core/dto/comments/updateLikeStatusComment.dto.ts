import { IsEnum, IsNotEmpty } from 'class-validator';
import { MyLikeStatus, UpdateLikeStatusCommentType } from '../../models';
import { TrimDecorator } from '../../../validation/decorators/trim.decorator';

export class UpdateLikeStatusCommentDto implements UpdateLikeStatusCommentType {
  @TrimDecorator()
  @IsNotEmpty()
  @IsEnum(MyLikeStatus)
  readonly likeStatus: MyLikeStatus;
}
