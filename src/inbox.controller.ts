import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { InboxService } from './inbox.service';

@Controller()
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Get('inbox')
  getInboxMessages() {
    return this.inboxService.getInboxMessages();
  }

  @Post('message')
  newInboxMessage(@Body() body: any) {
    return this.inboxService.newInboxMessage(body);
  }

  @Delete('message/:id')
  deleteInboxMessage(@Param() params: { id: string }) {
    return this.inboxService.deleteInboxMessage(params);
  }
}
