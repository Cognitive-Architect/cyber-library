import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chunk } from './entities/chunk.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chunk])],
  exports: [TypeOrmModule],
})
export class ChunksModule {}