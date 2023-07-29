import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogModel, BlogModelType } from '../../../core/entity';
import { SuperAdminRepository } from '../repository/super-admin.repository';
import { UsersTableType } from '../../../core/models';

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

  async checkedUser(userID: string): Promise<boolean> {
    const checkedUser: UsersTableType[] =
      await this.superAdminRepository.checkedUser(userID);

    if (checkedUser.length < 1) {
      throw new NotFoundException();
    }
    return true;
  }

  async deleteAllCollections() {
    await this.superAdminRepository.deleteAllCollections();
  }
}
