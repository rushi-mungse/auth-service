import { AppDataSource } from "./../config/dataSource";
import createHttpError from "http-errors";
import { UserData } from "../types";
import { User } from "../entity/User";

export class UserService {
    async create({ fullName, email, password }: UserData) {
        try {
            const userRepository = AppDataSource.getRepository(User);
            return await userRepository.save({ fullName, email, password });
        } catch (error) {
            const err = createHttpError(500, "Internal Database Error!");
            throw err;
        }
    }
}
