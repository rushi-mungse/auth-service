import { Request } from "express";

export interface UserData {
    fullName: string;
    email: string;
    password: string;
}
export interface RegisterUserRequest extends Request {
    body: UserData;
}
