import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lista } from './lista.entity';
import { ListaService } from './lista.service';
import { ListaController } from './lista.controller';
import { Registro } from '../registro/registro.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lista, Registro]),
    AuthModule
  ],
  controllers: [ListaController],
  providers: [ListaService],
  exports: [ListaService],
})
export class ListaModule {}
