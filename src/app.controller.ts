import { Controller, Delete, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { SuperAdminService } from './private/super-admin/application/super-admin.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    protected readonly superAdminService: SuperAdminService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('testing/all-data')
  async testingAllDelete() {
    await this.superAdminService.deleteAllCollections();
  }
}
