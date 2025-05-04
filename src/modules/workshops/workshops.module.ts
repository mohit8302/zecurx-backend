import { Module } from '@nestjs/common';
import { WorkshopsController } from './workshops.controller';
import { WorkshopsService } from './workshops.service';

@Module({
  controllers: [WorkshopsController],
  providers: [WorkshopsService]
})
export class WorkshopsModule {}
