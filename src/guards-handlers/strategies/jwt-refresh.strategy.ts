import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CONFIG } from '../../config/config';
import { RefreshCookieExtractor } from '../request-handlers';
import { AuthService } from '../../auth/application/auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor(protected authService: AuthService) {
    super({
      jwtFromRequest: RefreshCookieExtractor,
      ignoreExpiration: false,
      secretOrKey: CONFIG.JWT_REFRESH_SECRET,
    });
  }

  async validate(payload: any) {
    const validateSession: boolean =
      await this.authService.checkedActiveSession(
        payload.userID,
        payload.deviceId,
        payload.iat,
      );

    if (!validateSession) {
      throw new UnauthorizedException('Session expired');
    }
    return payload;
  }
}
