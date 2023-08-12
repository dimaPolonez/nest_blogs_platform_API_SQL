import { IsBoolean, IsNotEmpty, IsUUID, Length } from 'class-validator';
import { BanUserOfBlogType } from '../../models';
import { TrimDecorator } from '../../../validation/decorators/trim.decorator';

export class BanUserOfBlogDto implements BanUserOfBlogType {
  @TrimDecorator()
  @IsBoolean()
  @IsNotEmpty()
  readonly isBanned: boolean;

  @TrimDecorator()
  @Length(20)
  @IsNotEmpty()
  readonly banReason: string;

  @TrimDecorator()
  @IsNotEmpty()
  @IsUUID()
  readonly blogId: string;
}
