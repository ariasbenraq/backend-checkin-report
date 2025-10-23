import { Controller, Get, Post, Param, Body, Query, Patch, Delete, ParseIntPipe, UsePipes, ValidationPipe, UseGuards, Logger } from '@nestjs/common';
import { ListaService } from './lista.service';
import { CreateListaDto } from './dto/create-lista.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../auth/user.entity';
import { GetUser } from '../auth/get-user.decorator';
import { Lista } from './lista.entity';

@Controller('listas') // /listas
@UseGuards(AuthGuard('jwt'))
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class ListaController {
  private logger = new Logger('ListaController');
  constructor(private service: ListaService) { }

  @Get()
  getList(
    @Query() q: any,
    @GetUser() user: User,
  ): Promise<{ data: Lista[]; pageInfo: { page: number; limit: number; total: number } }> {
    this.logger.verbose(`(User ${user.username} retrieving all lists. Filters: ${JSON.stringify(q)})`);
    return this.service.getList(q, user);
  }

  @Post()
  create(
    @Body() dto: CreateListaDto,
    @GetUser() user: User
  ): Promise<Lista> {
    this.logger.verbose(`(User ${user.username} creating a new task. Data: ${JSON.stringify(dto)})`);
    return this.service.createList(dto, user);
  }


  @Get(':id')
  getOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<Lista> {
    return this.service.getListById(id, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @GetUser() user: User
  ): Promise<Lista> {
    return this.service.updateList(id, body, user);
  }

  @Delete(':id')
  async deleteLista(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User
  ): Promise<void> {
    return this.service.deleteLista(id, user);
  }
}
