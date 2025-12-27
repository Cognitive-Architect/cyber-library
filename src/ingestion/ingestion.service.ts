import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Document } from '../documents/entities/document.entity';
import { Chunk } from '../chunks/entities/chunk.entity';
import { EmbeddingService } from '../embedding/embedding.service';

// @ts-ignore
const Segment = require('segment');

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private readonly segment = new Segment();

  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    @InjectRepository(Chunk)
    private chunksRepository: Repository<Chunk>,
    private embeddingService: EmbeddingService,
    private dataSource: DataSource,
  ) {
    this.segment.useDefault();
  }

  async chunkAndEmbedDocument(documentId: string, content: string) {
    const doc = await this.documentsRepository.findOne({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');

    this.logger.log(`Starting ingestion for doc: ${documentId}`);

    const chunkSize = 500;
    const chunksData: string[] = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      chunksData.push(content.slice(i, i + chunkSize));
    }

    this.logger.log(`Generated ${chunksData.length} chunks. Generating embeddings...`);

    const embeddings = await Promise.all(
      chunksData.map((text) => this.embeddingService.generateEmbedding(text)),
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(Chunk, { document: { id: documentId } });

      for (let i = 0; i < chunksData.length; i++) {
        const chunkText = chunksData[i];
        
        const result = this.segment.doSegment(chunkText, { simple: true });
        const segmentedText = result.join(' '); 

        // 👇👇👇 核心修复点：把 "documentId" 改成了 document_id
        await queryRunner.query(
          `INSERT INTO chunks (id, content, embedding, document_id, search_vector)
           VALUES (uuid_generate_v4(), $1, $2, $3, to_tsvector('simple', $4))`,
          [chunkText, JSON.stringify(embeddings[i]), documentId, segmentedText]
        );
      }

      doc.status = 'completed';
      await queryRunner.manager.save(doc);

      await queryRunner.commitTransaction();
      this.logger.log(`Ingestion complete for doc: ${documentId}`);
      return { success: true, chunksCount: chunksData.length };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Ingestion failed: ${err.message}`);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}