import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeleteDateColumn, ManyToOne } from 'typeorm';
import { Registro } from '../registro/registro.entity';
import { User } from '../auth/user.entity';

@Entity('lista')
export class Lista {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nombre: string;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ length: 50, nullable: true })
  estado?: string;

  @Column({ type: 'text', unique: true, nullable: true })
  checksum?: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  created_at: Date;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  updated_at: Date;

  @OneToMany(() => Registro, (r) => r.lista, { cascade: true, eager: true })
  detalles: Registro[];

  @ManyToOne(() => User, (u) => u.listas, { eager: false, nullable: false })
  user: User;


  // Soft delete estándar (reemplaza isDeleted)
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date;
}
