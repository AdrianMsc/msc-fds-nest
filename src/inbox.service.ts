import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Injectable()
export class InboxService {
  constructor(private readonly db: DatabaseService) {}

  async getInboxMessages() {
    const query = 'select * from feedback c order by c.created_at';
    return this.db.query(query);
  }

  async newInboxMessage(body: any) {
    const { name, email, message, status = 'pending', read = false } = body ?? {};

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      throw new BadRequestException('Name, email, and message are required.');
    }

    const query = `
      INSERT INTO feedback (name, email, message, status, read)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;

    const values = [name.trim(), email.trim(), message.trim(), status, read];
    const [{ id }] = await this.db.query<{ id: number }>(query, values);

    return {
      success: true,
      message: 'Message successfully added!',
      data: { id, name, email, message, status, read },
    };
  }

  async deleteInboxMessage(params: { id: string }) {
    const { id } = params;
    const query = 'DELETE FROM feedback WHERE id = $1 RETURNING *';
    const result = await this.db.query(query, [id]);
    if ((result as any).rowCount === 0 || (result as any).length === 0) {
      throw new NotFoundException('Message not found');
    }
    return { response: 'Message deleted successfully', id };
  }
}
