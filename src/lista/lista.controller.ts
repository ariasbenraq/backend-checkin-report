import { Controller, Get, Post, Param, Body, Query, Patch, Delete, ParseIntPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { ListaService } from './lista.service';
import { CreateListaDto } from './dto/create-lista.dto';

@Controller('listas') // /listas
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class ListaController {
  constructor(private service: ListaService) {}

  @Post()
  create(@Body() dto: CreateListaDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query() q: any) {
    return this.service.findAll(q);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async deleteLista(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteLista(id);
  }
}
