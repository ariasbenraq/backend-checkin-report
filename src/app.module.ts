import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lista } from 'src/lista/lista.entity';
import { Registro } from 'src/registro/registro.entity';
import { ListaModule } from 'src/lista/lista.module';
import { RegistroModule } from 'src/registro/registro.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        entities: [Lista, Registro],
        synchronize: true, // ⚠️ usa migraciones; true solo en desarrollo inicial
        logging: true,
      }),
    }),
    ListaModule,
    RegistroModule,
  ],
})
export class AppModule {}
