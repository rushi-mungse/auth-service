import bcrypt from "bcrypt";
export default class CredentialService {
    async hashData(data: string) {
        const saltOrRound = 10;
        return await bcrypt.hash(data, saltOrRound);
    }

    async hashCompare(data: string, hash: string) {
        return await bcrypt.compare(data, hash);
    }
}
