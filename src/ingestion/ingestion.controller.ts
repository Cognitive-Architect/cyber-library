import { Controller, Post, Body } from '@nestjs/common';
import { IngestionService } from './ingestion.service';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('chunk-document')
  async chunkDocument(@Body() body: { documentId: string; content: string }) {
    // 👇 修复点 2：改用正确的方法名 chunkAndEmbedDocument
    return this.ingestionService.chunkAndEmbedDocument(body.documentId, body.content);
  }
}