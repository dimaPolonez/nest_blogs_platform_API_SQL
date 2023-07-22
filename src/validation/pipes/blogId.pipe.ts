import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { SuperAdminService } from '../../private/super-admin/application/super-admin.service';

@Injectable()
export class BlogIdPipe implements PipeTransform<string, string> {
  constructor(protected superAdminService: SuperAdminService) {}
  transform(value: string): string {
    const checkBlogId: Promise<boolean> =
      this.superAdminService.checkBlog(value);

    if (!checkBlogId) {
      throw new BadRequestException('Incorrect BlogId');
    }
    return value;
  }
}
