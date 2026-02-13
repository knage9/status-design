import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
    private readonly logger = new Logger(TelegramService.name);
    private readonly botToken: string | undefined;
    private readonly chatId: string | undefined;

    constructor(private configService: ConfigService) {
        this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
        this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
    }

    async sendMessage(message: string): Promise<void> {
        if (!this.botToken || !this.chatId) {
            this.logger.warn('Telegram Bot Token or Chat ID not configured. Skipping notification.');
            return;
        }

        const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.chatId,
                    text: message,
                    parse_mode: 'HTML',
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                this.logger.error(`Failed to send Telegram message: ${error}`);
            }
        } catch (error) {
            this.logger.error(`Error sending Telegram message: ${error.message}`);
        }
    }

    async sendNewRequestNotification(request: any): Promise<void> {
        const serviceMap: Record<string, string> = {
            'carbon': 'Карбон',
            'antichrome': 'Антихром с покраской',
            'shum': 'Шумоизоляция',
            'ceramic': 'Керамика',
            'antigravity-film': 'Антигравийная пленка',
            'disk-painting': 'Окрас дисков',
            'polish': 'Полировка',
            'cleaning': 'Химчистка',
        };

        const translate = (key: string) => serviceMap[key] || key;

        // Форматируем основную услугу
        const mainService = translate(request.mainService);

        // Форматируем список доп. услуг
        let additionalServices = 'нет';
        if (Array.isArray(request.additionalServices) && request.additionalServices.length > 0) {
            additionalServices = request.additionalServices.map(translate).join(', ');
        } else if (typeof request.additionalServices === 'string' && request.additionalServices.trim() !== '') {
            additionalServices = request.additionalServices.split(',').map(s => translate(s.trim())).join(', ');
        }

        const message = `
<b>🚀 Новая заявка на сайте!</b>

<b>👤 Имя:</b> ${request.name}
<b>📞 Телефон:</b> <code>${request.phone}</code>
<b>🚗 Авто:</b> ${request.carModel || 'Не указано'}
<b>🛠 Основная услуга:</b> ${mainService}
<b>➕ Доп. услуги:</b> ${additionalServices}
<b>💰 Скидка:</b> ${request.discount || 0}%
<b>📅 Дата:</b> ${new Date().toLocaleString('ru-RU')}
        `;
        await this.sendMessage(message.trim());
    }
}
