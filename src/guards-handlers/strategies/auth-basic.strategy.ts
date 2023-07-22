import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { CONFIG } from '../../config/config';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      passReqToCallback: true,
    });
  }

  async validate(req, username, password) {
    if (
      CONFIG.HTTP_BASIC_USER === username &&
      CONFIG.HTTP_BASIC_PASS === password
    ) {
      return true;
    }
  }
}
