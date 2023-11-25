import createHttpError from "http-errors";
import { UserData } from "../types";
import { User } from "../entity/User";
import { Repository } from "typeorm";
import { Logger } from "winston";
import bcrypt from "bcrypt";

export class UserService {
    constructor(
        private userRepository: Repository<User>,
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
            const saltOrRound = 10;
            const hashPassword = await bcrypt.hash(password, saltOrRound);
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
}
