import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LineWebhookController } from 'src/presentation/controllers/lineWebhookController';
import { LineWebhookService } from 'src/application/services/lineWebhookService';
import { MessageEventService } from 'src/application/services/messageEventService';
import { UserApi } from 'src/infrastructure/api/line/userApi';
import { FollowEventService } from 'src/application/services/followEventService';
import { UserModule } from 'src/modules/userModule';
import { MessageModule } from 'src/modules/messageModule';
import { ChannelAccessTokenModule } from 'src/modules/channelAccessTokenModule';

/**
 * LINE module
 */
@Module({
  imports: [HttpModule, UserModule, MessageModule, ChannelAccessTokenModule],
  controllers: [LineWebhookController],
  providers: [
    LineWebhookService,
    MessageEventService,
    FollowEventService,
    UserApi,
  ],
})
export class LineModule {}
