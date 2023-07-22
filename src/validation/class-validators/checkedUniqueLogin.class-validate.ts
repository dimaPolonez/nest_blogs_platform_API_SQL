import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../auth/application/auth.service';

@ValidatorConstraint()
@Injectable()
export class CheckedUniqueLogin implements ValidatorConstraintInterface {
  constructor(protected authService: AuthService) {}

  async validate(value: string): Promise<boolean> {
    return await this.authService.checkedUniqueLogin(value);
  }

  defaultMessage() {
    return 'Login $value is already in use';
  }
}
