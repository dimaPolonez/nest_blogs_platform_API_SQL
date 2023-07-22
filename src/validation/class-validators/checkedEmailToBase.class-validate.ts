import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../auth/application/auth.service';

@ValidatorConstraint()
@Injectable()
export class CheckedEmailToBase implements ValidatorConstraintInterface {
  constructor(protected authService: AuthService) {}

  async validate(value: string) {
    return await this.authService.checkedEmailToBase(value);
  }

  defaultMessage() {
    return 'User with this email $value does not exist';
  }
}
