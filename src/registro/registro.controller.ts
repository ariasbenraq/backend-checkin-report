import { Controller, Post, Get, Delete, Param, Body, Query, ParseIntPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { RegistroService } from './registro.service';
import { CreateRegistroDto } from './dto/create-registro.dto';

@Controller()
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class RegistroController {
  constructor(private service: RegistroService) {}

  // insertar uno
  @Post('record-items')
  createOne(@Body() dto: CreateRegistroDto) {
    return this.service.createOne(dto);
  }

  // insertar en lote para un lista_id
  @Post('listas/:listaId/items')
  createBatch(
    @Param('listaId', ParseIntPipe) listaId: number,
    @Body() body: { items: Omit<CreateRegistroDto,'lista_id'>[] },
  ) {
    const items = (body.items ?? []).map(it => ({ ...it, lista_id: listaId }));
    return this.service.createBatch(items);
  }

  // listar items de un record (para el modal)
  @Get('listas/:listaId/items')
  listByLista(
    @Param('listaId', ParseIntPipe) listaId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listByLista(listaId, Number(page ?? 1), Number(limit ?? 20));
  }

  @Delete('record-items/:id')
  async deleteRegistro(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteRegistro(id);
  }

}
