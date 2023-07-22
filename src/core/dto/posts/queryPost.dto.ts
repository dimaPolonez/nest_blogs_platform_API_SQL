import { Type } from 'class-transformer';
import { Min } from 'class-validator';
import { QueryPostType } from '../../models';

export class QueryPostDto implements QueryPostType {
  readonly sortBy = 'createdAt';
  readonly sortDirection = 'desc';
  @Min(1)
  @Type(() => Number)
  readonly pageNumber = 1;
  @Min(1)
  @Type(() => Number)
  readonly pageSize = 10;
}
