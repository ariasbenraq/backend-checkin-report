import { Controller, Get, Post, Param, Body, Query, Patch, Delete, ParseIntPipe, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
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
  constructor(private service: ListaService) { }

  @Get()
  getList(
    @Query() q: any,
    @GetUser() user: User,
  ): Promise<{ data: Lista[]; pageInfo: { page: number; limit: number; total: number } }> {
    return this.service.getList(q, user);
  }

  @Post()
  create(
    @Body() dto: CreateListaDto,
    @GetUser() user: User
  ): Promise<Lista> {
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
