import { Type } from 'class-transformer';
import { IsEnum, Min } from 'class-validator';
import { banStatus, QueryUsersAdminType } from '../../models';

export class QueryUsersAdminDto implements QueryUsersAdminType {
  @IsEnum(banStatus)
  readonly banStatus = 'all';
  readonly searchLoginTerm = '';
  readonly searchEmailTerm = '';
  readonly sortBy = 'createdAt';
  readonly sortDirection = 'desc';
  @Min(1)
  @Type(() => Number)
  readonly pageNumber = 1;
  @Min(1)
  @Type(() => Number)
  readonly pageSize = 10;
}
