import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecreto',
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      mail: payload.mail,
      nombreUsuario: payload.nombreUsuario,
      perfil: payload.perfil,
    };
  }
}
