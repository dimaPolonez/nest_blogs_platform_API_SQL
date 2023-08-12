import { Injectable } from '@nestjs/common';
import { SuperAdminRepository } from '../repository/super-admin.repository';

@Injectable()
export class SuperAdminService {
  constructor(protected superAdminRepository: SuperAdminRepository) {}

  async deleteAllCollections() {
    await this.superAdminRepository.deleteAllCollections();
  }
}
