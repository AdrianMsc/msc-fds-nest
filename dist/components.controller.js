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
exports.ComponentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const components_service_1 = require("./components.service");
let ComponentsController = class ComponentsController {
    componentsService;
    constructor(componentsService) {
        this.componentsService = componentsService;
    }
    handshake() {
        return this.componentsService.handshake();
    }
    getAllComponentNames() {
        return this.componentsService.getAllComponentNames();
    }
    getComponentCount() {
        return this.componentsService.getComponentCount();
    }
    getAllComponents() {
        return this.componentsService.getAllComponents();
    }
    createComponent(params, body, file) {
        return this.componentsService.createComponent(params, body, file);
    }
    updateResources(params, body) {
        return this.componentsService.updateComponentResources(params, body);
    }
    updateComponent(params, body, file) {
        return this.componentsService.updateComponent(params, body, file);
    }
    deleteComponent(params) {
        return this.componentsService.deleteComponent(params);
    }
};
exports.ComponentsController = ComponentsController;
__decorate([
    (0, common_1.Get)("handshake"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ComponentsController.prototype, "handshake", null);
__decorate([
    (0, common_1.Get)("allcomponents"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ComponentsController.prototype, "getAllComponentNames", null);
__decorate([
    (0, common_1.Get)("count"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ComponentsController.prototype, "getComponentCount", null);
__decorate([
    (0, common_1.Get)("components"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ComponentsController.prototype, "getAllComponents", null);
__decorate([
    (0, common_1.Post)("categories/:category/components"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("image")),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], ComponentsController.prototype, "createComponent", null);
__decorate([
    (0, common_1.Put)("components/resources/:id"),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ComponentsController.prototype, "updateResources", null);
__decorate([
    (0, common_1.Put)("categories/:category/components/:id"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("image")),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], ComponentsController.prototype, "updateComponent", null);
__decorate([
    (0, common_1.Delete)("components/:id"),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ComponentsController.prototype, "deleteComponent", null);
exports.ComponentsController = ComponentsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [components_service_1.ComponentsService])
], ComponentsController);
//# sourceMappingURL=components.controller.js.map