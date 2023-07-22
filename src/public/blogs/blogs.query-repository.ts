import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetAllBlogsType, GetBlogType, QueryBlogType } from '../../core/models';
import { BlogModel, BlogModelType } from '../../core/entity';
@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(BlogModel.name)
    private readonly BlogModel: Model<BlogModelType>,
  ) {}

  sortObject(sortDir: string) {
    return sortDir === 'desc' ? -1 : 1;
  }
  skippedObject(pageNum: number, pageSize: number) {
    return (pageNum - 1) * pageSize;
  }
  async findBlogById(blogID: string): Promise<GetBlogType> {
    const findBlogSmart: BlogModelType | null = await this.BlogModel.findById(
      blogID,
    );

    if (!findBlogSmart || findBlogSmart.banInfo.isBanned === true) {
      throw new NotFoundException();
    }

    return {
      id: findBlogSmart.id,
      name: findBlogSmart.name,
      description: findBlogSmart.description,
      websiteUrl: findBlogSmart.websiteUrl,
      createdAt: findBlogSmart.createdAt,
      isMembership: findBlogSmart.isMembership,
    };
  }

  async getAllBlogs(queryAll: QueryBlogType): Promise<GetAllBlogsType> {
    const allBlogs: BlogModelType[] = await this.BlogModel.find({
      'banInfo.isBanned': false,
      name: new RegExp(queryAll.searchNameTerm, 'gi'),
    })
      .skip(this.skippedObject(queryAll.pageNumber, queryAll.pageSize))
      .limit(queryAll.pageSize)
      .sort({
        [queryAll.sortBy]: this.sortObject(queryAll.sortDirection),
      });

    const allMapsBlogs: GetBlogType[] = allBlogs.map((field) => {
      return {
        id: field.id,
        name: field.name,
        description: field.description,
        websiteUrl: field.websiteUrl,
        createdAt: field.createdAt,
        isMembership: field.isMembership,
      };
    });

    const allCount: number = await this.BlogModel.countDocuments({
      'banInfo.isBanned': false,
      name: new RegExp(queryAll.searchNameTerm, 'gi'),
    });
    const pagesCount: number = Math.ceil(allCount / queryAll.pageSize);

    return {
      pagesCount: pagesCount,
      page: queryAll.pageNumber,
      pageSize: queryAll.pageSize,
      totalCount: allCount,
      items: allMapsBlogs,
    };
  }
}
