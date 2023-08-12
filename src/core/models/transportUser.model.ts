export type GetSessionUserType = {
  deviceId: string;
  ip: string;
  title: string;
  lastActiveDate: string;
};

export type CreateUserType = {
  login: string;
  password: string;
  email: string;
};

export type NewUserDTOType = {
  login: string;
  hushPass: string;
  email: string;
};

export type BanUserType = {
  isBanned: boolean;
  banReason: string;
};

export enum banStatus {
  all = 'all',
  banned = 'banned',
  notBanned = 'notBanned',
}

export type QueryUsersAdminType = {
  banStatus: string;
  searchLoginTerm: string;
  searchEmailTerm: string;
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
};

export type ConfirmUserType = {
  codeActivated: string;
  lifeTimeCode: string;
  confirm: boolean;
};

export type NewPassType = {
  newPassword: string;
  recoveryCode: string;
};

export type LoginType = {
  loginOrEmail: string;
  password: string;
};

export type AboutMeType = {
  email: string;
  login: string;
  userId: string;
};
