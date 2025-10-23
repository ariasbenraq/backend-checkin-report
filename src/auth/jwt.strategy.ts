import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { JwtPayload } from './jwt-payload.interface';

const nodeConfig = require('config');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(@InjectRepository(User) private userRepository: Repository<User>) {
        const hasNested = nodeConfig && typeof nodeConfig.has === 'function' ? nodeConfig.has('jwt.secret') : false;
        const cfgSecret = hasNested ? nodeConfig.get('jwt.secret') : undefined;
        const secret = process.env.JWT_SECRET ?? cfgSecret;

        if (!secret) {
            // Falla temprano y explícito
            throw new Error('JWT secret is not set. Provide JWT_SECRET env or set jwt.secret in config.');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { username } = payload;
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) throw new UnauthorizedException();
        return user;
    }
}
