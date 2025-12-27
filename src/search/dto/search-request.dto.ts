import { IsString, IsNotEmpty, IsInt, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class SearchRequestDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  k?: number = 5; // 默认查 5 条

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  threshold?: number = 0.5; // 相似度门槛
}