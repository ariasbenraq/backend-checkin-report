import { ConflictException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { In, Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    private logger = new Logger('AuthService');
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const { username, password } = authCredentialsDto;

        //1. Validar
        const existing = await this.userRepository.findOne({ where: { username } });
        if (existing) {
            // throw new Error('Username already exists');
            throw new ConflictException('Username already exists');
        }

        //2. Encriptar contraseña
        const salt = await bcrypt.genSalt();
        const hashed = await bcrypt.hash(password, salt);

        //3. Crear entidad de usuario
        const user = this.userRepository.create({ username, password: hashed });

        //4. Guardar en la base de datos
        await this.userRepository.save(user);
    }

    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
        const username = await this.validateUserPassword(authCredentialsDto);
        if (!username) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload: JwtPayload = { username };
        const accessToken = await this.jwtService.sign(payload);
        this.logger.debug(`Generated JWT Token with payload: ${JSON.stringify(payload)}`);
        return { accessToken };
    }

    async validateUserPassword(authCredentialsDto: AuthCredentialsDto): Promise<string | null> {
        const { username, password } = authCredentialsDto;
        const user = await this.userRepository.findOne({ where: { username } });

        if (user && await user.validatePassword(password)) {
            return user.username;
        } else {
            return null;
        }
    }

}
