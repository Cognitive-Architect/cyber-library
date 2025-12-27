import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { Chunk } from '../chunks/entities/chunk.entity';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chunk]),
    EmbeddingModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  // 👇 陛下，关键就是少了这一行！我们要把服务共享出去！
  exports: [SearchService], 
})
export class SearchModule {}