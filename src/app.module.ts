import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DocumentsModule } from './documents/documents.module';
import { ChunksModule } from './chunks/chunks.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { EmbeddingModule } from './embedding/embedding.module';
import { SearchModule } from './search/search.module';
import { ChatModule } from './chat/chat.module'; // 👈 新加的

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),
    DocumentsModule,
    ChunksModule,
    IngestionModule,
    EmbeddingModule,
    SearchModule,
    ChatModule, // 👈 别忘了我！
  ],
})
export class AppModule {}