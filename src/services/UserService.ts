import createHttpError from "http-errors";
import { UserData } from "../types";
import { User } from "../entity/User";
import { Repository } from "typeorm";
import { Logger } from "winston";

export class UserService {
    constructor(
        private userRepository: Repository<User>,
        private logger: Logger,
    ) {}
    async create({ fullName, email, password, role }: UserData) {
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
}
