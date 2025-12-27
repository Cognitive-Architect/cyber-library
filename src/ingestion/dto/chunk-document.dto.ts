import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class ChunkDocumentDto {
  @IsUUID()
  @IsNotEmpty()
  documentId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}