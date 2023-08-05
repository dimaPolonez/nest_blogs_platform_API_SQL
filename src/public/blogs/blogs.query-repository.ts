import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BlogsTableType,
  GetAllBlogsType,
  GetBlogType,
  QueryBlogType,
  TablesNames,
} from '../../core/models';
import { BlogModel, BlogModelType } from '../../core/entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectDataSource()
    protected dataSource: DataSource,
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
    const text = `SELECT * FROM "${TablesNames.Blogs}" WHERE "id" = $1`;

    const values = [blogID];

    const rawBlog: BlogsTableType[] = await this.dataSource.query(text, values);

    if (rawBlog.length < 1 || rawBlog[0].blogIsBanned === true) {
      throw new NotFoundException();
    }

    return {
      id: rawBlog[0].id,
      name: rawBlog[0].name,
      description: rawBlog[0].description,
      websiteUrl: rawBlog[0].websiteUrl,
      createdAt: rawBlog[0].createdAt,
      isMembership: rawBlog[0].isMembership,
    };
  }

  async getAllBlogs(queryAll: QueryBlogType): Promise<GetAllBlogsType> {
    const text1 = `SELECT * FROM "${TablesNames.Blogs}"
                   WHERE "blogIsBanned" = false 
                   AND ("name" ILIKE '%${queryAll.searchNameTerm}%')
                   ORDER BY "${queryAll.sortBy}" ${queryAll.sortDirection}
                   LIMIT $1 OFFSET $2`;
    const values1 = [
      queryAll.pageSize,
      this.skippedObject(queryAll.pageNumber, queryAll.pageSize),
    ];

    const rawAllBlogs: BlogsTableType[] = await this.dataSource.query(
      text1,
      values1,
    );

    const text2 = `SELECT * FROM "${TablesNames.Blogs}"
                   WHERE "blogIsBanned" = false 
                   AND ("name" ILIKE '%${queryAll.searchNameTerm}%')`;

    const rawAllBlogsCount: BlogsTableType[] = await this.dataSource.query(
      text2,
    );

    const allMapsBlogs: GetBlogType[] = rawAllBlogs.map((field) => {
      return {
        id: field.id,
        name: field.name,
        description: field.description,
        websiteUrl: field.websiteUrl,
        createdAt: field.createdAt,
        isMembership: field.isMembership,
      };
    });

    const allCount: number = rawAllBlogsCount.length;

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
