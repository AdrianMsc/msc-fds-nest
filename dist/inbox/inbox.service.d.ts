import { DatabaseService } from '../database/database.service';
export declare class InboxService {
    private readonly db;
    constructor(db: DatabaseService);
    getInboxMessages(): Promise<any[]>;
    newInboxMessage(body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            name: any;
            email: any;
            message: any;
            status: any;
            read: any;
        };
    }>;
    deleteInboxMessage(params: {
        id: string;
    }): Promise<{
        response: string;
        id: string;
    }>;
}
