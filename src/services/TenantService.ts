import { Repository } from "typeorm";
import { Tenant } from "../entity";
import { TenantData } from "../types";

export default class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}
    async create(tenantData: TenantData) {
        return await this.tenantRepository.save(tenantData);
    }

    async deleteById(tenantId: number) {
        return await this.tenantRepository.delete({ id: tenantId });
    }

    async getAll() {
        return await this.tenantRepository.find();
    }

    async getById(tenantId: number) {
        return await this.tenantRepository.findOne({ where: { id: tenantId } });
    }
}
