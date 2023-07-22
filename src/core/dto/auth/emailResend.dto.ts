import { IsNotEmpty, Matches, Validate } from 'class-validator';
import { CheckedEmailToBase } from '../../../validation/class-validators';
import { EmailResendType } from '../../models';
import { TrimDecorator } from '../../../validation/decorators/trim.decorator';

export class EmailResendDto implements EmailResendType {
  @Validate(CheckedEmailToBase)
  @TrimDecorator()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  @IsNotEmpty()
  readonly email: string;
}
