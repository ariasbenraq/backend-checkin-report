import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class CreateRegistroDto {
  @IsInt() @Min(1)
  lista_id: number;

  @IsString() @IsNotEmpty()
  area: string;

  @IsInt() @Min(0)
  total_voluntarios: number;

  @IsInt() @Min(0)
  post_vios: number;

  @IsString()
  observaciones?: string;
}
