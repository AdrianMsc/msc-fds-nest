import { DatabaseService } from '../database/database.service';
import { S3Service } from '../storage/s3.service';
export declare class ComponentsService {
    private readonly db;
    private readonly s3;
    constructor(db: DatabaseService, s3: S3Service);
    handshake(): Promise<string>;
    getAllComponentNames(): Promise<any[]>;
    getComponentCount(): Promise<{
        count: number;
    }>;
    getAllComponents(): Promise<any>;
    createComponent(params: {
        category: string;
    }, body: any, file?: Express.Multer.File): Promise<{
        message: string;
        componentId: number;
        imageUrl: string | null;
    }>;
    updateComponent(params: {
        category: string;
        id: string;
    }, body: any, file?: Express.Multer.File): Promise<{
        message: string;
    }>;
    updateComponentResources(params: {
        id: string;
    }, body: any): Promise<{
        message: string;
        updated: {
            statuses: boolean;
            links: boolean;
        };
    }>;
    deleteComponent(params: {
        id: string;
    }): Promise<{
        message: string;
    }>;
}
