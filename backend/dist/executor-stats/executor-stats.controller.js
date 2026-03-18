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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutorStatsController = void 0;
const common_1 = require("@nestjs/common");
const executor_stats_service_1 = require("./executor-stats.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const permissions_1 = require("../auth/permissions");
let ExecutorStatsController = class ExecutorStatsController {
    statsService;
    constructor(statsService) {
        this.statsService = statsService;
    }
    async getEarnings(req, startDateString, endDateString) {
        if (!startDateString || !endDateString) {
            throw new common_1.BadRequestException('Необходимо указать startDate и endDate');
        }
        const startDate = new Date(startDateString);
        const endDate = new Date(endDateString);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new common_1.BadRequestException('Некорректный формат дат');
        }
        return this.statsService.getEarnings(startDate, endDate, (0, permissions_1.buildCurrentUser)(req.user));
    }
};
exports.ExecutorStatsController = ExecutorStatsController;
__decorate([
    (0, common_1.Get)('earnings'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ExecutorStatsController.prototype, "getEarnings", null);
exports.ExecutorStatsController = ExecutorStatsController = __decorate([
    (0, common_1.Controller)('executor-stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [executor_stats_service_1.ExecutorStatsService])
], ExecutorStatsController);
//# sourceMappingURL=executor-stats.controller.js.map