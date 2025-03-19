import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    return req?.cookies?.access_token; // Extract token from cookies
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET, // Use JWT secret from environment variables
        });
    }

    async validate(payload: any) {
        //console.log('jwt strategy', payload);
        if (!payload) {
            throw new UnauthorizedException('Invalid token');
        }
        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
        }; // Attach user payload to `req.user`
    }
}
