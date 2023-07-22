import { IsNotEmpty, IsUUID, Validate } from 'class-validator';
import { CheckedConfirmCode } from '../../../validation/class-validators';
import { CodeConfirmType } from '../../models';
import { TrimDecorator } from '../../../validation/decorators/trim.decorator';

export class CodeConfirmDto implements CodeConfirmType {
  @Validate(CheckedConfirmCode)
  @TrimDecorator()
  @IsNotEmpty()
  @IsUUID()
  readonly code: string;
}
