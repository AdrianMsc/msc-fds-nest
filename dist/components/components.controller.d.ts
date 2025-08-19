import { ComponentsService } from './components.service';
export declare class ComponentsController {
    private readonly componentsService;
    constructor(componentsService: ComponentsService);
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
    updateResources(params: {
        id: string;
    }, body: any): Promise<{
        message: string;
        updated: {
            statuses: boolean;
            links: boolean;
        };
    }>;
    updateComponent(params: {
        category: string;
        id: string;
    }, body: any, file?: Express.Multer.File): Promise<{
        message: string;
    }>;
    deleteComponent(params: {
        id: string;
    }): Promise<{
        message: string;
    }>;
}
