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
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const serverless_1 = require("@neondatabase/serverless");
let DatabaseService = class DatabaseService {
    config;
    sql;
    constructor(config) {
        this.config = config;
        const url = this.config.get('DATABASE_URL');
        if (!url) {
            throw new Error('DATABASE_URL is not set');
        }
        this.sql = (0, serverless_1.neon)(url);
        const masked = this.maskDbUrl(url);
        console.log(`[Database] Initialized Neon client for ${masked}`);
    }
    get client() {
        return this.sql;
    }
    async query(text, params) {
        return this.sql.query(text, params);
    }
    async onModuleInit() {
        const start = Date.now();
        try {
            const res = await this.sql `select 1 as ok`;
            const ms = Date.now() - start;
            console.log(`[Database] Connectivity check passed in ${ms}ms:`, res?.[0]);
        }
        catch (err) {
            const ms = Date.now() - start;
            console.error(`[Database] Connectivity check FAILED in ${ms}ms:`, err);
        }
    }
    maskDbUrl(url) {
        try {
            const u = new URL(url);
            const host = u.host;
            const db = u.pathname?.replace(/^\//, '') || '';
            return `${host}/${db}`;
        }
        catch {
            return 'database (masked)';
        }
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseService);
//# sourceMappingURL=database.service.js.map