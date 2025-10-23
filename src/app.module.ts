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
      useFactory: () => ({
        type: nodeConfig.get('db.type'),
        host: process.env.RDS_HOST || nodeConfig.get('db.host'),
        port: process.env.RDS_PORT || nodeConfig.get('db.port'),
        username: process.env.RDS_USER || nodeConfig.get('db.username'),
        password: process.env.RDS_PASS || nodeConfig.get('db.password'),
        database: process.env.RDS_NAME || nodeConfig.get('db.database'),
        entities: [Lista, Registro, User],
        synchronize: process.env.TYPEORM_SYNC || config.synchronize,
        logging: true,
      }),
    }),
    ListaModule,
    RegistroModule,
    AuthModule,
  ],
  controllers: [HealthController], // 👈 registra aquí
})
export class AppModule {}
