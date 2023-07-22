import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { AuthService } from '../../auth/application/auth.service';

@Injectable()
export class UserIdPipe implements PipeTransform<string, string> {
  constructor(protected authService: AuthService) {}
  transform(value: string): string {
    const checkUserId: Promise<boolean> = this.authService.checkUser(value);

    if (!checkUserId) {
      throw new BadRequestException('Incorrect UserId');
    }
    return value;
  }
}
