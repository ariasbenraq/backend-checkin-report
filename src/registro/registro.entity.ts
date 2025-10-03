import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  Index, JoinColumn, Unique,
  BaseEntity,
  DeleteDateColumn
} from 'typeorm';
import { Lista } from '../lista/lista.entity';
import { IsOptional } from 'class-validator';

@Entity('registro')
@Unique(['lista', 'area'])               // UNIQUE(lista_id, area)
@Index('idx_registro_lista', ['lista'])  // INDEX(lista_id)
export class Registro extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Lista, (l) => l.detalles, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'lista_id' })      // nombre de la FK en BD
  lista: Lista;                          // ¡Propiedad es la relación, no "lista_id"!

  @Column({ length: 100 })
  area: string;

  @Column({ type: 'int' })
  total_voluntarios: number;

  @Column({ type: 'int' })
  post_vios: number; // (si luego renombras, ajusta DTOs/migración)

  @Column({ type: 'text', nullable: true })
  observaciones?: string | null;;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  created_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date;
}
