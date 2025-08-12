import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ComponentsController } from '../components.controller';
import { ComponentsService } from '../components.service';
import { DatabaseModule } from '../database/database.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [MulterModule.register({}), DatabaseModule, StorageModule],
  controllers: [ComponentsController],
  providers: [ComponentsService],
})
export class ComponentsModule {}
