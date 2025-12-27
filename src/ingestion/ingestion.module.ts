import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { DocumentsModule } from '../documents/documents.module';
import { ChunksModule } from '../chunks/chunks.module';
import { EmbeddingModule } from '../embedding/embedding.module'; // 👈 新引入

@Module({
  imports: [
    DocumentsModule, 
    ChunksModule,
    EmbeddingModule // 👈 挂载上去
  ],
  controllers: [IngestionController],
  providers: [IngestionService],
})
export class IngestionModule {}