import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchRequestDto } from './dto/search-request.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async search(@Body() dto: SearchRequestDto) {
    const results = await this.searchService.search(dto);
    return {
      success: true,
      data: results,
    };
  }
}