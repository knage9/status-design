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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
const common_2 = require("@nestjs/common");
let DashboardController = class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getDashboardData() {
        return this.dashboardService.getDashboardStats();
    }
    async getExecutorStats(startDate, endDate, serviceType, executorId) {
        return this.dashboardService.getExecutorStats(startDate, endDate, serviceType, executorId ? parseInt(executorId) : undefined);
    }
    async getLoadChart() {
        return this.dashboardService.getLoadChart();
    }
    async updatePayment(id, paidAmount, isPaid) {
        return this.dashboardService.updateExecutorPayment(parseInt(id), paidAmount, isPaid);
    }
    async manager(userId, req) {
        const uid = userId ? parseInt(userId) : req?.user?.userId;
        return this.dashboardService.getManagerDashboard(uid);
    }
    async master(userId, req) {
        const uid = userId ? parseInt(userId) : req?.user?.userId;
        return this.dashboardService.getMasterDashboard(uid);
    }
    async executor(userId, req) {
        const uid = userId ? parseInt(userId) : req?.user?.userId;
        return this.dashboardService.getExecutorDashboard(uid);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDashboardData", null);
__decorate([
    (0, common_1.Get)('executor-stats'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('serviceType')),
    __param(3, (0, common_1.Query)('executorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getExecutorStats", null);
__decorate([
    (0, common_1.Get)('load-chart'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getLoadChart", null);
__decorate([
    (0, common_1.Patch)('update-payment/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('paidAmount')),
    __param(2, (0, common_1.Body)('isPaid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Boolean]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "updatePayment", null);
__decorate([
    (0, common_1.Get)('manager'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_2.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "manager", null);
__decorate([
    (0, common_1.Get)('master'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_2.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "master", null);
__decorate([
    (0, common_1.Get)('executor'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_2.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "executor", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map