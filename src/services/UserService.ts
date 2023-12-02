import createHttpError from "http-errors";
import { CredentialService } from "./";
import { UserData } from "../types";
import { User } from "../entity";
import { Repository } from "typeorm";
import { Logger } from "winston";

export default class UserService {
    constructor(
        private userRepository: Repository<User>,
        private credentialService: CredentialService,
        private logger: Logger,
    ) {}

    async createUser({ fullName, email, password, role }: UserData) {
        let user;
        try {
            user = await this.userRepository.findOne({
                where: { email: email },
            });
        } catch (error) {
            throw createHttpError(500, "Internal Database Error!");
        }

        if (user) {
            const error = createHttpError(
                400,
                "This email is already registered!",
            );
            throw error;
        }

        try {
            return await this.userRepository.save({
                fullName,
                email,
                password,
                role,
            });
        } catch (error) {
            throw createHttpError(500, "Internal Database Error!");
        }
    }

    async isUserExist(email: string): Promise<boolean> {
        try {
            const exists = await this.userRepository.findOne({
                where: { email: email },
            });
            if (exists) return true;
        } catch (error) {
            throw createHttpError(500, "Internal Database Error!");
        }
        return false;
    }

    async findUserById(id: number) {
        return await this.userRepository.findOne({ where: { id } });
    }

    async deleteUserById(id: number) {
        return await this.userRepository.delete(id);
    }

    async findUserByEmail(email: string) {
        return await this.userRepository.findOne({ where: { email } });
    }

    async updateUserPassword(userId: number, hashPassword: string) {
        try {
            return await this.userRepository.update(userId, {
                password: hashPassword,
            });
        } catch (err) {
            const error = createHttpError(
                500,
                "Failed to update the user in the database",
            );
            throw error;
        }
    }
}
