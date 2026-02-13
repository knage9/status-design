import { ConfigService } from '@nestjs/config';
export declare class TelegramService {
    private configService;
    private readonly logger;
    private readonly botToken;
    private readonly chatId;
    constructor(configService: ConfigService);
    sendMessage(message: string): Promise<void>;
    sendNewRequestNotification(request: any): Promise<void>;
}
