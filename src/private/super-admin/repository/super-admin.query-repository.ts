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
    let rawAllUsers: UsersTableType[] = [];

    const banStatusFilter = await this.userBannedChecked(queryAll.banStatus);

    const text = `SELECT * FROM "${TablesNames.Users}"
          WHERE ${banStatusFilter}
          ("login" ILIKE '%${queryAll.searchLoginTerm}%' 
          OR "email" ILIKE '%${queryAll.searchEmailTerm}%')
          ORDER BY "${queryAll.sortBy}" ${queryAll.sortDirection}
          LIMIT $1 OFFSET $2`;

    const values = [
      queryAll.pageSize,
      this.skippedObject(queryAll.pageNumber, queryAll.pageSize),
    ];

    rawAllUsers = await this.dataSource.query(text, values);

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
