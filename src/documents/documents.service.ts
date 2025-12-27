import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {}

  async create(createDocumentDto: CreateDocumentDto) {
    // 👇 修复点：只传 Entity 里真正有的字段
    const doc = this.documentsRepository.create({
      title: createDocumentDto.title,
      content: createDocumentDto.content,
      status: 'pending', // 初始状态
      // ❌ 删掉了 chunkCount: 0 (数据库里没这列，传了就报错)
    });
    return await this.documentsRepository.save(doc);
  }

  async findAll() {
    // 查列表时，把关联的 chunks 也稍微带一下（可选）
    return await this.documentsRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string) {
    return await this.documentsRepository.findOne({ 
      where: { id },
      relations: ['chunks'] // 查详情时，顺便把切片也查出来
    });
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto) {
    await this.documentsRepository.update(id, updateDocumentDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.documentsRepository.delete(id);
    return { deleted: true };
  }
}