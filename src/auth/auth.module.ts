import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './application/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { SessionsController } from './sessions.controller';
import {
  CheckedConfirmCode,
  CheckedEmailToBase,
  CheckedUniqueEmail,
  CheckedUniqueLogin,
} from '../validation/class-validators';
import { ActiveCodeAdapter, BcryptAdapter, MailerAdapter } from '../adapters';
import { AuthRepository } from './repository/auth.repository';
import {
  ConfirmEmailUseCase,
  CreateNewPasswordUseCase,
  CreateTokensUseCase,
  DeleteAllSessionsUseCase,
  DeleteOneSessionUseCase,
  EmailResendingUseCase,
  GetAllSessionUseCase,
  GetUserInfUseCase,
  LogoutUseCase,
  PasswordRecoveryUseCase,
  RegistrationUserUseCase,
  UpdateTokensUseCase,
} from './application/use-cases';
import { CqrsModule } from '@nestjs/cqrs';

const modules = [CqrsModule, PassportModule, JwtModule];

const validators = [
  CheckedUniqueLogin,
  CheckedConfirmCode,
  CheckedEmailToBase,
  CheckedUniqueEmail,
];
const adapters = [BcryptAdapter, MailerAdapter, ActiveCodeAdapter];

const useCases = [
  PasswordRecoveryUseCase,
  CreateNewPasswordUseCase,
  CreateTokensUseCase,
  UpdateTokensUseCase,
  ConfirmEmailUseCase,
  RegistrationUserUseCase,
  EmailResendingUseCase,
  LogoutUseCase,
  GetUserInfUseCase,
  GetAllSessionUseCase,
  DeleteOneSessionUseCase,
  DeleteAllSessionsUseCase,
];

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    ...modules,
  ],
  providers: [
    AuthService,
    AuthRepository,
    ...validators,
    ...adapters,
    ...useCases,
  ],
  controllers: [AuthController, SessionsController],
  exports: [AuthService],
})
export class AuthModule {}
