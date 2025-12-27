import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { SearchModule } from '../search/search.module'; // 👈 借用搜索模块

@Module({
  imports: [ConfigModule, SearchModule], 
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}