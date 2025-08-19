import { InboxService } from './inbox.service';
export declare class InboxController {
    private readonly inboxService;
    constructor(inboxService: InboxService);
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
