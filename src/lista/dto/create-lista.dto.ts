import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsDateString, IsOptional, IsIn, IsArray, ValidateNested } from 'class-validator';
import { CreateRegistroInlineDto } from './create-registro-inline.dto';

export class CreateListaDto {
  @IsString() @IsNotEmpty()
  nombre: string;

  @IsDateString()
  fecha: string; // ISO 8601

  @IsOptional() @IsString() @IsIn(['procesado','pendiente','error'], { message: 'estado inválido'})
  estado?: string;

  @IsOptional() @IsString()
  checksum?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRegistroInlineDto)
  detalles: CreateRegistroInlineDto[];
}
