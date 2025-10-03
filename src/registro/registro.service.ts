import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registro } from './registro.entity';
import { CreateRegistroDto } from './dto/create-registro.dto';

@Injectable()
export class RegistroService {
    constructor(@InjectRepository(Registro) private repo: Repository<Registro>) { }

    async createOne(dto: CreateRegistroDto) {
        const entity = this.repo.create({
            area: dto.area,
            total_voluntarios: dto.total_voluntarios,
            post_vios: dto.post_vios,
            observaciones: dto.observaciones,
            lista: { id: dto.lista_id } as any,   // 👈 enlaza por relación
        });
        return this.repo.save(entity);
    }

    async createBatch(items: CreateRegistroDto[]) {
        const entities = items.map(it =>
            this.repo.create({
                area: it.area,
                total_voluntarios: it.total_voluntarios,
                post_vios: it.post_vios,
                observaciones: it.observaciones,
                lista: { id: it.lista_id } as any,      // 👈 igual aquí
            }),
        );
        return this.repo.save(entities);
    }

    async listByLista(listaId: number, page = 1, limit = 20) {
        const [data, total] = await this.repo.findAndCount({
            where: { lista: { id: listaId } },   // 👈 filtra por la relación
            order: { id: 'ASC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, pageInfo: { page, limit, total } };
    }

    async getRegistroById(id: number): Promise<Registro> {
        const found = await this.repo.findOne({ where: { id } });
        if (!found) throw new NotFoundException('registro no encontrado');
        return found;
    }

    async remove(id: number) {
        const found = await this.repo.findOne({ where: { id } });
        if (!found) throw new NotFoundException('registro no encontrado');
        await this.repo.remove(found);
        return { ok: true };

    }

    async deleteRegistro(id: number): Promise<void> {
        await this.repo.softDelete(id);
    }
}

