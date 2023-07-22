import { IsNotEmpty, IsUrl, Length } from 'class-validator';
import { CreateBlogType } from '../../models';
import { TrimDecorator } from '../../../validation/decorators/trim.decorator';

export class CreateBlogDto implements CreateBlogType {
  @TrimDecorator()
  @Length(1, 15)
  @IsNotEmpty()
  readonly name: string;

  @TrimDecorator()
  @Length(1, 500)
  @IsNotEmpty()
  readonly description: string;

  @TrimDecorator()
  @Length(1, 100)
  @IsUrl()
  @IsNotEmpty()
  readonly websiteUrl: string;
}
