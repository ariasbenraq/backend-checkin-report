import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lista } from 'src/lista/lista.entity';
import { Registro } from 'src/registro/registro.entity';
import { ListaModule } from 'src/lista/lista.module';
import { RegistroModule } from 'src/registro/registro.module';
import { HealthController } from './health.controller';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/user.entity';
import * as config from 'config'; 

const nodeConfig = require('config');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        // Si hay DATABASE_URL, usamos eso (Neon / producción)
        const url = process.env.DATABASE_URL;

        if (url) {
          return {
            type: 'postgres' as const,
            url,
            entities: [Lista, Registro, User],
            // En prod: nunca sincronices; ya importaste el schema
            synchronize: String(process.env.TYPEORM_SYNC).toLowerCase() === 'true',
            ssl: { rejectUnauthorized: false },
            logging: true,
          };
        }

        // Si NO hay DATABASE_URL, usamos config YAML (desarrollo/local)
        return {
          type: 'postgres' as const,
          host: process.env.RDS_HOST ?? nodeConfig.get('db.host'),
          port: Number(process.env.RDS_PORT ?? nodeConfig.get('db.port')),
          username: process.env.RDS_USER ?? nodeConfig.get('db.username'),
          password: process.env.RDS_PASS ?? nodeConfig.get('db.password'),
          database: process.env.RDS_NAME ?? nodeConfig.get('db.database'),
          entities: [Lista, Registro, User],
          synchronize:
            String(process.env.TYPEORM_SYNC ?? nodeConfig.get('db.synchronize')).toLowerCase() === 'true',
          ssl: nodeConfig.get('db.ssl') ? { rejectUnauthorized: false } : false,
          logging: true,
        };
      },
    }),
    ListaModule,
    RegistroModule,
    AuthModule,
  ],
  controllers: [HealthController], // 👈 registra aquí
})
export class AppModule {}
