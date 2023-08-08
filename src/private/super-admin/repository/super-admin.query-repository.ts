import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BlogsTableType,
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
    const text1 = `SELECT *,
                   (SELECT COUNT(*) as "allCount" FROM "${TablesNames.Blogs}" 
                   WHERE "name" ILIKE '%${queryAll.searchNameTerm}%')
                   FROM "${TablesNames.Blogs}"
                   WHERE "name" ILIKE '%${queryAll.searchNameTerm}%' 
                   ORDER BY "${queryAll.sortBy}" ${queryAll.sortDirection}
                   LIMIT $1 OFFSET $2`;

    const values = [
      queryAll.pageSize,
      this.skippedObject(queryAll.pageNumber, queryAll.pageSize),
    ];

    const rawAllBlogs = await this.dataSource.query(text1, values);

    const mappedAllBlogs: GetBlogAdminType[] = rawAllBlogs.map(
      (field: BlogsTableType) => {
        return {
          id: field.id,
          name: field.name,
          description: field.description,
          websiteUrl: field.websiteUrl,
          createdAt: field.createdAt,
          isMembership: field.isMembership,
          blogOwnerInfo: {
            userId: field.userOwnerId,
            userLogin: field.userOwnerLogin,
          },
          banInfo: {
            isBanned: field.blogIsBanned,
            banDate: field.banDate,
          },
        };
      },
    );

    const allCount: number =
      rawAllBlogs.length > 0 ? +rawAllBlogs[0].allCount : 0;

    const pagesCount: number = Math.ceil(allCount / queryAll.pageSize);

    return {
      pagesCount: pagesCount,
      page: queryAll.pageNumber,
      pageSize: queryAll.pageSize,
      totalCount: allCount,
      items: mappedAllBlogs,
    };
  }

  async userBannedChecked(banStatus: string) {
    switch (banStatus) {
      case 'banned':
        return `"userIsBanned"=true AND`;
      case 'notBanned':
        return `"userIsBanned"=false AND`;
      case 'all':
        return ``;
    }
  }
  async getAllUsersAdmin(
    queryAll: QueryUsersAdminType,
  ): Promise<GetAllUsersAdminType> {
    const banStatusFilter = await this.userBannedChecked(queryAll.banStatus);

    const text1 = `SELECT *,
                   (SELECT COUNT(*) as "allCount" FROM "${TablesNames.Users}" 
                   WHERE ${banStatusFilter}
                   ("login" ILIKE '%${queryAll.searchLoginTerm}%' 
                   OR "email" ILIKE '%${queryAll.searchEmailTerm}%'))
                   FROM "${TablesNames.Users}"
                   WHERE ${banStatusFilter}
                   ("login" ILIKE '%${queryAll.searchLoginTerm}%' 
                   OR "email" ILIKE '%${queryAll.searchEmailTerm}%')
                   ORDER BY "${queryAll.sortBy}" ${queryAll.sortDirection}
                   LIMIT $1 OFFSET $2`;

    const values = [
      queryAll.pageSize,
      this.skippedObject(queryAll.pageNumber, queryAll.pageSize),
    ];

    const rawAllUsers = await this.dataSource.query(text1, values);

    const mappedAllUsers: GetUserAdminType[] = rawAllUsers.map((field) => {
      return {
        id: field.id,
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

    const allCount: number =
      rawAllUsers.length > 0 ? +rawAllUsers[0].allCount : 0;

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
