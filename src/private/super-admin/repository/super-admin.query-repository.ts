import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GetAllBlogsAdminType,
  GetAllBlogsType,
  GetAllUsersAdminType,
  GetBlogAdminType,
  GetUserAdminType,
  QueryBlogType,
  QueryUsersAdminType,
  TablesNames,
  UsersTableType,
} from '../../../core/models';
import {
  BlogModel,
  BlogModelType,
  UserModel,
  UserModelType,
} from '../../../core/entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SuperAdminQueryRepository {
  constructor(
    @InjectModel(BlogModel.name)
    private readonly BlogModel: Model<BlogModelType>,
    @InjectModel(UserModel.name)
    private readonly UserModel: Model<UserModelType>,
    @InjectDataSource()
    protected dataSource: DataSource,
  ) {}

  sortObject(sortDir: string) {
    return sortDir === 'desc' ? -1 : 1;
  }
  skippedObject(pageNum: number, pageSize: number) {
    return (pageNum - 1) * pageSize;
  }

  async getAllBlogsToAdmin(
    queryAll: QueryBlogType,
  ): Promise<GetAllBlogsAdminType> {
    const allBlogs: BlogModelType[] = await this.BlogModel.find({
      name: new RegExp(queryAll.searchNameTerm, 'gi'),
    })
      .skip(this.skippedObject(queryAll.pageNumber, queryAll.pageSize))
      .limit(queryAll.pageSize)
      .sort({
        [queryAll.sortBy]: this.sortObject(queryAll.sortDirection),
      });

    const allMapsBlogs: GetBlogAdminType[] = allBlogs.map((field) => {
      return {
        id: field.id,
        name: field.name,
        description: field.description,
        websiteUrl: field.websiteUrl,
        createdAt: field.createdAt,
        isMembership: field.isMembership,
        blogOwnerInfo: {
          userId: field.blogOwnerInfo.userId,
          userLogin: field.blogOwnerInfo.userLogin,
        },
        banInfo: {
          isBanned: field.banInfo.isBanned,
          banDate: field.banInfo.banDate,
        },
      };
    });

    const allCount: number = await this.BlogModel.countDocuments({
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

  async getAllUsersAdmin(
    queryAll: QueryUsersAdminType,
  ): Promise<GetAllUsersAdminType> {
    let rawAllUsers: UsersTableType[] = [];

    const text = `SELECT * FROM "${TablesNames.Users}"
              WHERE ("login" ILIKE $1 OR "email" ILIKE $2)
              AND ("userIsBanned" = $3 OR ($3 = 'all' AND TRUE))
              ORDER BY $4 $5
              LIMIT $6 OFFSET $7`;
    const values = [
      queryAll.searchLoginTerm,
      queryAll.searchEmailTerm,
      queryAll.banStatus === 'banned' || queryAll.banStatus === 'notBanned'
        ? queryAll.banStatus === 'banned'
        : 'all',
      queryAll.sortBy,
      queryAll.sortDirection,
      queryAll.pageSize,
      this.skippedObject(queryAll.pageNumber, queryAll.pageSize),
    ];

    rawAllUsers = await this.dataSource.query(text, values);

    const mappedAllUsers: GetUserAdminType[] = rawAllUsers.map((field) => {
      return {
        id: field.userId,
        login: field.login,
        email: field.email,
        createdAt: field.createdAt,
        banInfo: {
          isBanned: field.userIsBanned,
          banDate: field.banDate,
          banReason: field.banReason,
        },
      };
    });

    const allCount: number = mappedAllUsers.length;

    const pagesCount: number = Math.ceil(allCount / queryAll.pageSize);

    return {
      pagesCount: pagesCount,
      page: queryAll.pageNumber,
      pageSize: queryAll.pageSize,
      totalCount: allCount,
      items: mappedAllUsers,
    };
  }
}
