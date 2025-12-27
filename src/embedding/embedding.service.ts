import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingService {
  private openai: OpenAI;
  private readonly logger = new Logger(EmbeddingService.name);
  // 👇 修改点：告诉它这个 Key 可能是 string，也可能是 undefined，别报错！
  private readonly apiKey: string | undefined;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (this.apiKey) {
      this.openai = new OpenAI({ apiKey: this.apiKey });
    } else {
      this.logger.warn('⚠️ No API Key found. Running in MOCK MODE.');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.apiKey || process.env.MOCK_EMBEDDING === 'true') {
      this.logger.debug(`Generating MOCK embedding...`);
      return Array.from({ length: 1536 }, () => Math.random());
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.replace(/\n/g, ' '),
      });
      return response.data[0].embedding;
    } catch (error) {
      this.logger.error(`OpenAI Error: ${error.message}`);
      throw new InternalServerErrorException('Failed to generate embedding');
    }
  }
}