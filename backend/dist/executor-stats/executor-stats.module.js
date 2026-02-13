"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutorStatsModule = void 0;
const common_1 = require("@nestjs/common");
const executor_stats_controller_1 = require("./executor-stats.controller");
const executor_stats_service_1 = require("./executor-stats.service");
const prisma_module_1 = require("../prisma/prisma.module");
let ExecutorStatsModule = class ExecutorStatsModule {
};
exports.ExecutorStatsModule = ExecutorStatsModule;
exports.ExecutorStatsModule = ExecutorStatsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [executor_stats_controller_1.ExecutorStatsController],
        providers: [executor_stats_service_1.ExecutorStatsService],
        exports: [executor_stats_service_1.ExecutorStatsService],
    })
], ExecutorStatsModule);
//# sourceMappingURL=executor-stats.module.js.map