import { PipeTransform, Injectable } from '@nestjs/common';
import { SuperAdminService } from '../../private/super-admin/application/super-admin.service';

@Injectable()
export class ValidUserIdPipe implements PipeTransform<string, string> {
  constructor(protected superAdminService: SuperAdminService) {}
  transform(value: string): string {
    const checkUserId: Promise<boolean> =
      this.superAdminService.checkedUser(value);

    if (checkUserId) {
      return value;
    }
  }
}
