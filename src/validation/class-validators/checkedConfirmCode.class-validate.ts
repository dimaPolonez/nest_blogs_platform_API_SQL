import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../auth/application/auth.service';

@ValidatorConstraint()
@Injectable()
export class CheckedConfirmCode implements ValidatorConstraintInterface {
  constructor(protected authService: AuthService) {}

  async validate(value: any) {
    return await this.authService.checkedConfirmCode(value);
  }

  defaultMessage() {
    return 'Code $value is not valid';
  }
}
