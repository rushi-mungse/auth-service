import bcrypt from "bcrypt";
export class HashService {
    static async hashData(data: string) {
        const saltOrRound = 10;
        return await bcrypt.hash(data, saltOrRound);
    }

    static async hashCompare(data: string, hash: string) {
        return await bcrypt.compare(data, hash);
    }
}
