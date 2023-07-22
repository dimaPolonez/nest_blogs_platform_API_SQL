import { Injectable } from '@nestjs/common';
import { BlogModel, BlogModelType } from '../../../core/entity';
import { SuperAdminRepository } from '../repository/super-admin.repository';

@Injectable()
export class SuperAdminService {
  constructor(protected superAdminRepository: SuperAdminRepository) {}

  async checkBlog(blogID: string): Promise<boolean> {
    const checkedBlog: BlogModelType | null =
      await this.superAdminRepository.findBlogById(blogID);

    if (!checkedBlog) {
      return false;
    }
    return true;
  }

  async deleteAllCollections() {
    await this.superAdminRepository.deleteAllCollections();
  }
}
