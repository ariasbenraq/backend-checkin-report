// listas/dto/create-registro-inline.dto.ts
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRegistroInlineDto {
  @IsString()
  area: string;

  @IsOptional()
  @IsString()
  subarea?: string;

  @Type(() => Number)
  @IsInt() @Min(0)
  total_voluntarios: number;

  @Type(() => Number)  
  @IsInt() @Min(0)
  post_vios: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
