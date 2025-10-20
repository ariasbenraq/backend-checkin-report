import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import * as bcrypt from "bcrypt";
import { Lista } from "../lista/lista.entity";

@Entity('users')
@Unique(['username'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @OneToMany(type => Lista, lista => lista.user, { eager: true })
  listas: Lista[];

  async validatePassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.password);

  }
}