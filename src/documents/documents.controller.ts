import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // 统一响应包装（MVP 简单实现，后面可以用全局拦截器替代）
  private success(data: any) {
    return {
      success: true,
      data,
    };
  }

  @Post()
  async create(@Body() createDocumentDto: CreateDocumentDto) {
    const data = await this.documentsService.create(createDocumentDto);
    return this.success(data);
  }

  @Get()
  async findAll() {
    const data = await this.documentsService.findAll();
    return this.success(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.documentsService.findOne(id);
    return this.success(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    const data = await this.documentsService.update(id, updateDocumentDto);
    return this.success(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.documentsService.remove(id);
    return this.success({ deleted: true });
  }
}
