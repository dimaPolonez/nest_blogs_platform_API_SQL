import { IsNotEmpty, IsUUID, Length, Validate } from 'class-validator';
import { CheckedConfirmCode } from '../../../validation/class-validators';
import { NewPassType } from '../../models';
import { TrimDecorator } from '../../../validation/decorators/trim.decorator';

export class NewPassDto implements NewPassType {
  @TrimDecorator()
  @Length(6, 20)
  @IsNotEmpty()
  readonly newPassword: string;

  @Validate(CheckedConfirmCode)
  @TrimDecorator()
  @Length(6, 20)
  @IsUUID()
  @IsNotEmpty()
  readonly recoveryCode: string;
}
