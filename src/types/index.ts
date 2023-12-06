import { Request } from "express";

export interface Tenant {
    id: number;
    name: string;
    address: string;
    rating: number;
}

export interface User {
    id: number;
    fullName: string;
    email: string;
    role: string;
}

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

export interface LoginData {
    email: string;
    password: string;
}

export interface LoginRequest extends Request {
    body: LoginData;
}

export interface RefreshTokenPayload {
    sub: string;
    id: string;
    role: string;
}

export interface ForgetPasswordRequest extends Request {
    body: {
        email: string;
    };
}

export interface SetPasswordData {
    email: string;
    hashOtp: string;
    otp: string;
    password: string;
    confirmPassword: string;
}

export interface SetPasswordRequest extends Request {
    body: SetPasswordData;
}

export interface TenantData {
    name: string;
    address: string;
    rating?: number;
}

export interface TenantRequest extends Request {
    body: TenantData;
}
