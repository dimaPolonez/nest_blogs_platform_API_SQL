import { IsBoolean, IsNotEmpty } from 'class-validator';
import { BanBlogType } from '../../models';
import { TrimDecorator } from '../../../validation/decorators/trim.decorator';

export class BanBlogDto implements BanBlogType {
  @TrimDecorator()
  @IsBoolean()
  @IsNotEmpty()
  readonly isBanned: boolean;
}
