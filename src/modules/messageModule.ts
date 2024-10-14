import { Module } from '@nestjs/common';
import { PushMessageService } from 'src/application/services/pushMessageService';
import { MessageApi } from 'src/infrastructure/api/line/messageApi';
import { HttpModule } from '@nestjs/axios';

/**
 * Message module
 */
@Module({
  imports: [HttpModule],
  providers: [PushMessageService, MessageApi],
  exports: [PushMessageService],
})
export class MessageModule {}
