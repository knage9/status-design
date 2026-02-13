"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const reviews_module_1 = require("./reviews/reviews.module");
const posts_module_1 = require("./posts/posts.module");
const portfolio_module_1 = require("./portfolio/portfolio.module");
const uploads_module_1 = require("./uploads/uploads.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const requests_module_1 = require("./requests/requests.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const work_orders_module_1 = require("./work-orders/work-orders.module");
const executor_stats_module_1 = require("./executor-stats/executor-stats.module");
const load_chart_module_1 = require("./load-chart/load-chart.module");
const telegram_module_1 = require("./telegram/telegram.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'uploads'),
                serveRoot: '/uploads',
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'admin-client/dist'),
                serveRoot: '/admin',
            }),
            prisma_module_1.PrismaModule, reviews_module_1.ReviewsModule, posts_module_1.PostsModule, portfolio_module_1.PortfolioModule, uploads_module_1.UploadsModule, dashboard_module_1.DashboardModule, requests_module_1.RequestsModule, auth_module_1.AuthModule, users_module_1.UsersModule, work_orders_module_1.WorkOrdersModule, executor_stats_module_1.ExecutorStatsModule, load_chart_module_1.LoadChartModule, telegram_module_1.TelegramModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map