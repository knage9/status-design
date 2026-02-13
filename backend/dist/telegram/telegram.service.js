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
var TelegramService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let TelegramService = TelegramService_1 = class TelegramService {
    configService;
    logger = new common_1.Logger(TelegramService_1.name);
    botToken;
    chatId;
    constructor(configService) {
        this.configService = configService;
        this.botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
        this.chatId = this.configService.get('TELEGRAM_CHAT_ID');
    }
    async sendMessage(message) {
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
        }
        catch (error) {
            this.logger.error(`Error sending Telegram message: ${error.message}`);
        }
    }
    async sendNewRequestNotification(request) {
        const serviceMap = {
            'carbon': 'Карбон',
            'antichrome': 'Антихром с покраской',
            'shum': 'Шумоизоляция',
            'ceramic': 'Керамика',
            'antigravity-film': 'Антигравийная пленка',
            'disk-painting': 'Окрас дисков',
            'polish': 'Полировка',
            'cleaning': 'Химчистка',
        };
        const translate = (key) => serviceMap[key] || key;
        const mainService = translate(request.mainService);
        let additionalServices = 'нет';
        if (Array.isArray(request.additionalServices) && request.additionalServices.length > 0) {
            additionalServices = request.additionalServices.map(translate).join(', ');
        }
        else if (typeof request.additionalServices === 'string' && request.additionalServices.trim() !== '') {
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
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = TelegramService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map