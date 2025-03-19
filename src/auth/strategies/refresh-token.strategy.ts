import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
    Strategy,
    'refresh',
) {
    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    return req?.cookies?.refresh_token; // Extract refresh token from cookies
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.REFRESH_TOKEN_SECRET, // Use refresh token secret
        });
    }

    async validate(payload: any) {
        console.log('Refresh strategy payload=>', payload);
        const user = await this.authService.validateRefreshToken(payload.sub);
        if (!user) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
        }; // Attach user payload to `req.user`
    }
}
