import { Request } from 'express';

export interface AuthRequest extends Request {
    user?: any; // Define your JWT payload type if possible
}