import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Lista } from './lista.entity';
import { CreateListaDto } from './dto/create-lista.dto';

@Injectable()
export class ListaService {
  constructor(@InjectRepository(Lista) private repo: Repository<Lista>) { }

  async create(dto: CreateListaDto) {
    // Idempotencia por checksum (si lo mandas)
    if (dto.checksum) {
      const dup = await this.repo.findOne({ where: { checksum: dto.checksum } });
      if (dup) throw new ConflictException('PDF ya registrado (checksum duplicado)');
    }
    const entity = this.repo.create({
      nombre: dto.nombre,
      fecha: dto.fecha,
      estado: dto.estado ?? 'procesado',
      checksum: dto.checksum,
      detalles: (dto.detalles ?? []).map(d => ({
        area: d.area,
        total_voluntarios: d.total_voluntarios,
        post_vios: d.post_vios,
        observaciones: d.observaciones ?? null,
      })),
    });

    try {
      return await this.repo.save(entity);
    } catch (e: any) {
      // Duplicate key (Postgres)
      if (e?.code === '23505') throw new ConflictException('Checksum duplicado');
      throw e;
    }
  }

  async findAll(params: { page?: number; limit?: number; search?: string; estado?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(params.limit ?? 10)));
    const where: FindOptionsWhere<Lista> = {};
    if (params.estado) where.estado = params.estado;
    if (params.search) where.nombre = ILike(`%${params.search}%`);

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { fecha: 'DESC', id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, pageInfo: { page, limit, total } };
  }

  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('lista no encontrada');
    return found;
  }

  async update(id: number, patch: Partial<Lista>) {
    const found = await this.findOne(id);
    Object.assign(found, patch);
    // si fecha es string
    if (patch && 'fecha' in patch && patch.fecha) {
      (found as any).fecha = patch.fecha as any; // porque es 'date' string
    }
    return this.repo.save(found);
  }

  async remove(id: number) {
    const found = await this.findOne(id);
    await this.repo.remove(found);
    return { ok: true };
  }

  async deleteLista(id: number): Promise<void> {
    // soft delete
    await this.repo.softDelete(id);
  }

}
