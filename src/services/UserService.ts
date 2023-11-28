import { CredentialService } from "./CredentialService";
import createHttpError from "http-errors";
import { UserData } from "../types";
import { User } from "../entity/User";
import { Repository } from "typeorm";
import { Logger } from "winston";

export class UserService {
    constructor(
        private userRepository: Repository<User>,
        private credentialService: CredentialService,
        private logger: Logger,
    ) {}

    async create({ fullName, email, password, role }: UserData) {
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
            const hashPassword =
                await this.credentialService.hashData(password);
            return await this.userRepository.save({
                fullName,
                email,
                password: hashPassword,
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
            throw createHttpError(500, "Enternal Database Error!");
        }
        return false;
    }

    async getUserById(id: number) {
        return await this.userRepository.findOne({ where: { id } });
    }
}
