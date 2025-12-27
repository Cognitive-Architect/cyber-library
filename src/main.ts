import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. 开启 CORS (跨域允许)
  // 这就像是打开城门，允许未来的前端网页 (localhost:xxxx) 访问咱们的后端
  app.enableCors();

  // 2. 开启全局验证管道 (ValidationPipe)
  // 这就像是开启城门口的安检仪
  // 它会让咱们写的那些 DTO 规则 (@IsString, @IsInt) 真正生效！
  // 如果有人乱传参数，系统会自动拦截并返回 400 Bad Request
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // 自动剔除 DTO 里没定义的垃圾字段
    transform: true, // 自动把参数转成对的类型 (比如把字符串 '3' 转成数字 3)
  }));

  await app.listen(3000);
  console.log(`🚀 Cyber Library is running on: http://localhost:3000`);
}
bootstrap();