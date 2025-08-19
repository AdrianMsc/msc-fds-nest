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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InboxController = void 0;
const common_1 = require("@nestjs/common");
const inbox_service_1 = require("./inbox.service");
let InboxController = class InboxController {
    inboxService;
    constructor(inboxService) {
        this.inboxService = inboxService;
    }
    getInboxMessages() {
        return this.inboxService.getInboxMessages();
    }
    newInboxMessage(body) {
        return this.inboxService.newInboxMessage(body);
    }
    deleteInboxMessage(params) {
        return this.inboxService.deleteInboxMessage(params);
    }
};
exports.InboxController = InboxController;
__decorate([
    (0, common_1.Get)('inbox'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InboxController.prototype, "getInboxMessages", null);
__decorate([
    (0, common_1.Post)('message'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InboxController.prototype, "newInboxMessage", null);
__decorate([
    (0, common_1.Delete)('message/:id'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InboxController.prototype, "deleteInboxMessage", null);
exports.InboxController = InboxController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [inbox_service_1.InboxService])
], InboxController);
//# sourceMappingURL=inbox.controller.js.map