import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

// CommonJS import garantiza .get(...)
const nodeConfig = require('config');

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (): any => {
        // Lee de node-config y permite override por ENV
        const jwtCfg = nodeConfig.get('jwt') as { secret?: string; expiresIn?: string | number };
        const secret = process.env.JWT_SECRET ?? jwtCfg.secret;
        const expiresIn = process.env.JWT_EXPIRES_IN ?? jwtCfg.expiresIn ?? 3600;
        if (!secret) {
          throw new Error('JWT secret is not set. Provide JWT_SECRET env or set jwt.secret in config.');
        }
        return {
          secret,
          signOptions: { expiresIn: expiresIn as any }, // acepta "12h" o 3600
        };
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
