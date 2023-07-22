import { Min } from 'class-validator';
import { Type } from 'class-transformer';
import { QueryPostOfBlogType } from '../../models';

export class QueryPostOfBlogDto implements QueryPostOfBlogType {
  readonly sortBy = 'createdAt';
  readonly sortDirection = 'desc';
  @Min(1)
  @Type(() => Number)
  readonly pageNumber = 1;
  @Min(1)
  @Type(() => Number)
  readonly pageSize = 10;
}
