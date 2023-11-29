import { Request } from "express";

export interface UserData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword?: string;
    role?: string;
}
export interface SendOtpRequest extends Request {
    body: UserData;
}

export interface VerifyOtpData {
    fullName: string;
    email: string;
    hashOtp: string;
    otp: string;
}

export interface VerifyOtpRequest extends Request {
    body: VerifyOtpData;
}

export interface AuthCookie {
    accessToken: string;
    refreshToken: string;
}

export interface AuthRequest extends Request {
    auth: {
        sub: number;
        role: string;
        id: string;
    };
}
