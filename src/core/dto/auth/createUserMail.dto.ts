import { IsNotEmpty, Length, Matches, Validate } from 'class-validator';
import {
  CheckedUniqueEmail,
  CheckedUniqueLogin,
} from '../../../validation/class-validators';
import { CreateUserMailType } from '../../models';
import { TrimDecorator } from '../../../validation/decorators/trim.decorator';

export class CreateUserMailDto implements CreateUserMailType {
  @Validate(CheckedUniqueLogin)
  @TrimDecorator()
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @Length(3, 10)
  @IsNotEmpty()
  readonly login: string;

  @TrimDecorator()
  @Length(6, 20)
  @IsNotEmpty()
  readonly password: string;

  @Validate(CheckedUniqueEmail)
  @TrimDecorator()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  @IsNotEmpty()
  readonly email: string;
}
