type BanInfo = {
  isBanned: boolean;
  banDate: string;
  banReason: string;
};

export type GetUserAdminType = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: BanInfo;
};

export type GetAllUsersAdminType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: GetUserAdminType[];
};
