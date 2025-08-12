import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export type NeonSql = any;
export declare class DatabaseService implements OnModuleInit {
    private readonly config;
    private readonly sql;
    constructor(config: ConfigService);
    get client(): NeonSql;
    query<T = any>(text: string, params?: any[]): Promise<T[]>;
    onModuleInit(): Promise<void>;
    private maskDbUrl;
}
