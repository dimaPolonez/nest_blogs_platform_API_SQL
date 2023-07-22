import { IsNotEmpty, Length, Matches } from 'class-validator';
import { CreateUserType } from '../../models';
import { TrimDecorator } from '../../../validation/decorators/trim.decorator';

export class CreateUserDto implements CreateUserType {
  @TrimDecorator()
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @Length(3, 10)
  @IsNotEmpty()
  readonly login: string;

  @TrimDecorator()
  @Length(6, 20)
  @IsNotEmpty()
  readonly password: string;

  @TrimDecorator()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  @IsNotEmpty()
  readonly email: string;
}
