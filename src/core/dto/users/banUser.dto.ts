import { IsBoolean, IsNotEmpty, Length } from 'class-validator';
import { BanUserType } from '../../models';
import { TrimDecorator } from '../../../validation/decorators/trim.decorator';

export class BanUserDto implements BanUserType {
  @TrimDecorator()
  @IsBoolean()
  @IsNotEmpty()
  readonly isBanned: boolean;

  @TrimDecorator()
  @Length(20)
  @IsNotEmpty()
  readonly banReason: string;
}
