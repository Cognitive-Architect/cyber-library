import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
// 👇 1. 引入 Chunk，为了建立关系
import { Chunk } from '../../chunks/entities/chunk.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // 👇 2. 加上这一段：Document 拥有一对多的 Chunks
  @OneToMany(() => Chunk, (chunk) => chunk.document)
  chunks: Chunk[];
}