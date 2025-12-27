import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SearchService } from '../search/search.service';
import { ChatRequestDto } from './dto/chat-request.dto';

@Injectable()
export class ChatService {
  private openai: OpenAI;
  private readonly logger = new Logger(ChatService.name);
  private readonly apiKey: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly searchService: SearchService, // 👈 注入搜索服务
  ) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (this.apiKey) {
      this.openai = new OpenAI({ apiKey: this.apiKey });
    }
  }

  async chat(dto: ChatRequestDto) {
    const { message } = dto;

    // 1. 先去图书馆“查资料” (RAG 的 Retrieval 部分)
    // 这里的 k=3 意味着我们只取最相关的 3 个片段给 AI 看
    const searchResults = await this.searchService.search({ 
      query: message, 
      k: 3, 
      // ❌ 删掉了 threshold: 0.0，因为 SearchService 已经不需要它了
    });

    // 2. 把查到的资料拼成一段“背景知识”
    const context = searchResults.map(r => r.content).join('\n\n');

    // 3. 构建 Prompt (提示词)
    const systemPrompt = `
    你是一个基于“赛博图书馆”知识库的 AI 助手。
    请根据下面的【背景知识】来回答用户的【问题】。
    如果【背景知识】里没有答案，请直接说“我不知道”。

    【背景知识】：
    ${context}
    `;

    // 4. 调用 AI (Generation 部分)
    if (!this.apiKey || process.env.MOCK_EMBEDDING === 'true') {
      // 注意：这里我顺手帮您补上了 sources，这样 Mock 模式下也能看到引用来源
      return this.mockChatResponse(message, context, searchResults);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // 或者 gpt-4
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
      });
      return {
        answer: response.choices[0].message.content,
        sources: searchResults, // 把参考来源也返回去，显得专业
      };
    } catch (error) {
      this.logger.error(`OpenAI Error: ${error.message}`);
      return { answer: 'AI 大脑短路了，请稍后再试。', sources: [] };
    }
  }

  // 👇 咱们的省钱替身 (顺便把 sources 也加上了)
  private mockChatResponse(message: string, context: string, sources: any[]) {
    this.logger.log(`[Mock Chat] Context found: ${context.length} chars`);
    return {
      answer: `[Mock AI]: 我已收到您的问题：“${message}”。\n根据检索到的 ${context.length} 字符的资料（李狗蛋...），我认为答案是：李狗蛋确实在做空。`,
      sources: sources, // ✅ 现在返回真实的搜索结果
    };
  }
}