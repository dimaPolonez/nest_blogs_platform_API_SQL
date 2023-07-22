import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  Length,
  Validate,
} from 'class-validator';
import { BanUserOfBlogType } from '../../models';
import { TrimDecorator } from '../../../validation/decorators/trim.decorator';
import { BlogIdPipe } from '../../../validation/pipes/blogId.pipe';

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
  @Validate(BlogIdPipe)
  readonly blogId: string;
}
