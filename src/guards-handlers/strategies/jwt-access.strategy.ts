import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CONFIG } from '../../config/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../../auth/application/auth.service';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy) {
  constructor(protected authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: CONFIG.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: any) {
    const userName: string = await this.authService.findUserLogin(
      payload.userID,
    );
    return { userID: payload.userID, login: userName };
  }
}
