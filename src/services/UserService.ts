import createHttpError from "http-errors";
import { UserData } from "../types";
import { User } from "../entity/User";
import { Repository } from "typeorm";

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ fullName, email, password }: UserData) {
        try {
            return await this.userRepository.save({
                fullName,
                email,
                password,
            });
        } catch (error) {
            throw createHttpError(500, "Internal Database Error!");
        }
    }
}
