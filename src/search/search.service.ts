import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chunk } from '../chunks/entities/chunk.entity';

// 👇 1. 引入 "诺基亚" 版分词库
// @ts-ignore
const Segment = require('segment');

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly segment = new Segment();

  constructor(
    @InjectRepository(Chunk)
    private chunkRepo: Repository<Chunk>,
  ) {
    this.segment.useDefault();
  }

  async search(params: { query: string; k?: number }) {
    const { query, k = 5 } = params;
    
    // 👇 2. 分词
    const result = this.segment.doSegment(query, { simple: true });
    const segmentedQuery = result.join(' & ');
    
    this.logger.log(`Hybrid Search Query: "${query}" -> TsQuery: [${segmentedQuery}]`);

    // Mock 向量
    const mockEmbeddingVector = Array(1536).fill(0).map(() => Math.random()); 
    const vectorStr = `[${mockEmbeddingVector.join(',')}]`;

    const results = await this.chunkRepo
      .createQueryBuilder('chunk')
      .select('chunk.id', 'id')
      .addSelect('chunk.content', 'content')
      .addSelect(`(1 - (chunk.embedding <=> '${vectorStr}'))`, 'semantic_score')
      .addSelect(
        `ts_rank_cd(chunk.search_vector, to_tsquery('simple', :tsQuery))`, 
        'keyword_score'
      )
      .addOrderBy(
        `(1 - (chunk.embedding <=> '${vectorStr}')) * 0.7 + ts_rank_cd(chunk.search_vector, to_tsquery('simple', :tsQuery)) * 0.3`,
        'DESC'
      )
      .setParameter('tsQuery', segmentedQuery)
      .take(k)
      .getRawMany();

    return results.map(r => ({
      id: r.id,
      content: r.content,
      score: r.semantic_score * 0.7 + r.keyword_score * 0.3,
      debug: {
        semantic: r.semantic_score,
        keyword: r.keyword_score
      }
    }));
  }
}