// Import your User type from Prisma
import { Request } from 'express';

export interface RequestWithUser extends Request {
    user: {
        userId: number;
        email: string;
        role: string;
    };
}
