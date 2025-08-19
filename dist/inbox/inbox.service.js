"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InboxService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let InboxService = class InboxService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getInboxMessages() {
        const query = 'select * from feedback c order by c.created_at';
        return this.db.query(query);
    }
    async newInboxMessage(body) {
        const { name, email, message, status = 'pending', read = false } = body ?? {};
        if (!name?.trim() || !email?.trim() || !message?.trim()) {
            throw new common_1.BadRequestException('Name, email, and message are required.');
        }
        const query = `
      INSERT INTO feedback (name, email, message, status, read)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
        const values = [name.trim(), email.trim(), message.trim(), status, read];
        const [{ id }] = await this.db.query(query, values);
        return {
            success: true,
            message: 'Message successfully added!',
            data: { id, name, email, message, status, read },
        };
    }
    async deleteInboxMessage(params) {
        const { id } = params;
        const query = 'DELETE FROM feedback WHERE id = $1 RETURNING *';
        const result = await this.db.query(query, [id]);
        if (result.rowCount === 0 || result.length === 0) {
            throw new common_1.NotFoundException('Message not found');
        }
        return { response: 'Message deleted successfully', id };
    }
};
exports.InboxService = InboxService;
exports.InboxService = InboxService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], InboxService);
//# sourceMappingURL=inbox.service.js.map