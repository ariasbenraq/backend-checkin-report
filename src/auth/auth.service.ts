import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { In, Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
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
}
