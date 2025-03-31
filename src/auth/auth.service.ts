import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
// import { CreateAuthDto } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { SignupDto } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                role: true,
                firstName: true,
                password: true,
            }, // Ensure firstName is selected
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password'); // Prevent email enumeration
        }

        const isPasswordValid = await argon2.verify(user.password, password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password'); // Generic message for security
        }

        // Remove password before returning user data
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...result } = user;
        return result;
    }

    async validateRefreshToken(userId: number): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                email: true,
                refreshToken: true, // Include refreshToken if needed for comparison
            },
        });
        if (!user || !user.refreshToken) {
            return null;
        }
        return user; // Compare hashed token with incoming token
    }

    async signup(signupDto: SignupDto) {
        // Check if the email is already registered
        const existingUser = await this.prisma.user.findUnique({
            where: { email: signupDto.email },
        });
        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Hash the password using argon2
        const hashedPassword = await argon2.hash(signupDto.password);

        // Create the user
        const user = await this.prisma.user.create({
            data: {
                firstName: signupDto.firstName,
                lastName: signupDto.lastName,
                email: signupDto.email,
                password: hashedPassword,
                role: signupDto.role || 'USER',
            },
        });

        // Omit the password from the response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.role !== 'ADMIN' && user.role !== 'SUBADMIN') {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate access token
        const accessToken = this.jwtService.sign(
            { email: user.email, sub: user.id, role: user.role },
            { expiresIn: this.configService.get<string>('JWT_EXPIRATION') },
        );

        // Generate refresh token
        const refreshToken = this.jwtService.sign(
            { email: user.email, sub: user.id },
            {
                secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
                expiresIn: this.configService.get<string>(
                    'REFRESH_TOKEN_EXPIRATION',
                ),
            },
        );

        // Hash the refresh token before storing it in the database
        const hashedRefreshToken = await argon2.hash(refreshToken);

        // Store refresh token in the database
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: hashedRefreshToken },
        });

        return {
            accessToken,
            refreshToken,
            role: user.role,
            firstName: user.firstName,
        };
    }

    async getCurrentUser(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            }, // Exclude sensitive fields
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async refreshTokens(userId: number, refreshToken: string) {
        // Find the user and validate the refresh token
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // Compare the incoming refresh token with the hashed version in the database
        const isTokenValid = await argon2.verify(
            user.refreshToken,
            refreshToken,
        );
        if (!isTokenValid) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // Generate new tokens
        const payload = { email: user.email, sub: user.id, role: user.role };
        const newAccessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
        });
        const newRefreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
            expiresIn: this.configService.get<string>(
                'REFRESH_TOKEN_EXPIRATION',
            ),
        });

        // Hash the new refresh token and store it in the database
        const hashedRefreshToken = await argon2.hash(newRefreshToken);
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: hashedRefreshToken },
        });

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }

    async logout(userId: number): Promise<void> {
        // Clear the refresh token in the User model
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null }, // Set refreshToken to null
        });
    }

    // create(createAuthDto: CreateAuthDto) {
    //     return 'This action adds a new auth';
    // }

    // findAll() {
    //     return `This action returns all auth`;
    // }

    // findOne(id: number) {
    //     return `This action returns a #${id} auth`;
    // }

    // update(id: number, updateAuthDto: UpdateAuthDto) {
    //     return `This action updates a #${id} auth`;
    // }

    // remove(id: number) {
    //     return `This action removes a #${id} auth`;
    // }
}
