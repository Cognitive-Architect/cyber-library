import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
// ❌ 暂时注释掉 Project
// import { Project } from '../../projects/entities/project.entity';
import { Document } from '../../documents/entities/document.entity';

@Entity('chunks')
export class Chunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  // 👇👇👇 修复点：删掉了 @Index(...) 这一行！
  // 向量字段 (我们已经在 SQL 里手动建过 HNSW 索引了，不需要 TypeORM 再乱动)
  @Column({ type: 'vector', length: 1536, nullable: true })
  embedding: number[];

  // 搜索向量字段
  @Column({ type: 'tsvector', select: false, nullable: true })
  search_vector: any;

  // ❌ 暂时注释掉 Project 关系
  // @ManyToOne(() => Project, (project) => project.chunks, { onDelete: 'CASCADE', nullable: true })
  // @JoinColumn({ name: 'project_id' })
  // project: Project;

  // ✅ Document 关系
  @ManyToOne(() => Document, (document) => document.chunks, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'document_id' })
  document: Document;
}