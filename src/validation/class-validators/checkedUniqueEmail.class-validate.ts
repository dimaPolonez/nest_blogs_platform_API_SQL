import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../auth/application/auth.service';

@ValidatorConstraint()
@Injectable()
export class CheckedUniqueEmail implements ValidatorConstraintInterface {
  constructor(protected authService: AuthService) {}

  async validate(value: string) {
    return await this.authService.checkedUniqueEmail(value);
  }

  defaultMessage() {
    return 'Mail $value is already in use';
  }
}
