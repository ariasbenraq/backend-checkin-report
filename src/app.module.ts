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

        // Fallback local solo si realmente tienes config/*.yml
        const hasDb = nodeConfig && typeof nodeConfig.has === 'function' ? nodeConfig.has('db') : false;
        if (!hasDb) {
          throw new Error(
            'No DATABASE_URL env and no db config found. Set DATABASE_URL on Render.'
          );
        }

        const getIf = (k: string, def?: any) =>
          nodeConfig.has(k) ? nodeConfig.get(k) : def;    

        // Si NO hay DATABASE_URL, usamos config YAML (desarrollo/local)
        return {
          type: 'postgres' as const,
          host: process.env.RDS_HOST ?? getIf('db.host'),
          port: Number(process.env.RDS_PORT ?? getIf('db.port')),
          username: process.env.RDS_USER ?? getIf('db.username'),
          password: process.env.RDS_PASS ?? getIf('db.password'),
          database: process.env.RDS_NAME ?? getIf('db.database'),
          entities: [Lista, Registro, User],
          synchronize:
            String(process.env.TYPEORM_SYNC ?? getIf('db.synchronize')).toLowerCase() === 'true',
          ssl: getIf('db.ssl') ? { rejectUnauthorized: false } : false,
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
export class AppModule { }
