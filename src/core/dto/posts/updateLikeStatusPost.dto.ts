import { IsEnum, IsNotEmpty } from 'class-validator';
import { MyLikeStatus, UpdateLikeStatusPostType } from '../../models';
import { TrimDecorator } from '../../../validation/decorators/trim.decorator';

export class UpdateLikeStatusPostDto implements UpdateLikeStatusPostType {
  @TrimDecorator()
  @IsNotEmpty()
  @IsEnum(MyLikeStatus)
  readonly likeStatus: MyLikeStatus;
}
