import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() dto: ChatRequestDto) {
    return await this.chatService.chat(dto);
  }
}