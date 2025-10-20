import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Lista } from './lista.entity';
import { CreateListaDto } from './dto/create-lista.dto';
import { User } from '../auth/user.entity';

@Injectable()
export class ListaService {
  constructor(@InjectRepository(Lista) private repo: Repository<Lista>) { }

  async createList(dto: CreateListaDto, user: User): Promise<Lista> {
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
      user: user,
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

  async getList(
    params: { page?: number; limit?: number; search?: string; estado?: string },
    user: User
  ): Promise<{ data: Lista[]; pageInfo: { page: number; limit: number; total: number } }> {
    const page = Math.max(1, Number(params.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(params.limit ?? 10)));

    const where: FindOptionsWhere<Lista> = {
      // 🔐 clave: filtrar por dueño
      user: { id: user.id },

      // filtros opcionales
      ...(params.estado ? { estado: params.estado } : {}),
      ...(params.search ? { nombre: ILike(`%${params.search}%`) } : {}),

      // si quieres asegurar excluir soft-deleted manualmente:
      // deleted_at: IsNull(),
    };

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { fecha: 'DESC', id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      // relations: { user: false }, // no necesitas cargar user
    });

    return { data, pageInfo: { page, limit, total } };
  }

  async getListById(
    id: number,
    user: User
  ): Promise<Lista> {
    const found = await this.repo.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!found) throw new NotFoundException('lista no encontrada');
    return found;
  }

  async updateList(id: number, patch: Partial<Lista>, user: User): Promise<Lista> {
    const list = await this.getListById(id, user);

    // Opcional: whitelisting de campos que sí se pueden actualizar
    const updatable: (keyof Lista)[] = ['nombre', 'fecha', 'estado'];
    for (const k of updatable) {
      if (k in patch && patch[k] !== undefined) {
        (list as any)[k] = (patch as any)[k];
      }
    }
    return this.repo.save(list);
  }

  async remove(
    id: number,
    user: User
  ) {
    const found = await this.getListById(id, user);
    await this.repo.remove(found);
    return { ok: true };
  }

  async deleteLista(
    id: number,
    user: User
  ): Promise<void> {
    const lista = await this.getListById(id, user);
    if (!lista) {
      throw new NotFoundException('Lista no encontrada');
    }
    await this.repo.softDelete(id);
  }

}
