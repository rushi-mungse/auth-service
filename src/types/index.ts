import { Request } from "express";

export interface UserData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword?: string;
    role?: string;
}
export interface RegisterUserRequest extends Request {
    body: UserData;
}
