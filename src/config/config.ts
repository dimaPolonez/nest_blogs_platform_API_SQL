import process from 'process';
import { ConfigModule } from '@nestjs/config';
export const CONFIG = {
  START_MODULE: ConfigModule.forRoot(),
  MONGO_DB: process.env.MONGO_DB,
  PORT: process.env.PORT,
  MAIL_URL_USER: process.env.MAIL_URL_USER,
  MAIL_URL_PASS: process.env.MAIL_URL_PASS,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  HTTP_BASIC_USER: process.env.HTTP_BASIC_USER,
  HTTP_BASIC_PASS: process.env.HTTP_BASIC_PASS,
  EXPIRES_ACCESS: 540,
  EXPIRES_REFRESH: 5400,
};
