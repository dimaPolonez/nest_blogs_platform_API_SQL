import { IsNotEmpty, Matches, Validate } from 'class-validator';
import { CheckedEmailToBase } from '../../../validation/class-validators';
import { EmailRecPassType } from '../../models';
import { TrimDecorator } from '../../../validation/decorators/trim.decorator';

export class EmailRecPassDto implements EmailRecPassType {
  @Validate(CheckedEmailToBase)
  @TrimDecorator()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  @IsNotEmpty()
  readonly email: string;
}
