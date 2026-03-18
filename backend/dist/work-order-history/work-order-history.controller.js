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
exports.WorkOrderHistoryController = void 0;
const common_1 = require("@nestjs/common");
const work_order_history_service_1 = require("./work-order-history.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const permissions_1 = require("../auth/permissions");
let WorkOrderHistoryController = class WorkOrderHistoryController {
    historyService;
    constructor(historyService) {
        this.historyService = historyService;
    }
    getHistory(id, req) {
        return this.historyService.getHistory(id, (0, permissions_1.buildCurrentUser)(req.user));
    }
};
exports.WorkOrderHistoryController = WorkOrderHistoryController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], WorkOrderHistoryController.prototype, "getHistory", null);
exports.WorkOrderHistoryController = WorkOrderHistoryController = __decorate([
    (0, common_1.Controller)('work-orders/:id/history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [work_order_history_service_1.WorkOrderHistoryService])
], WorkOrderHistoryController);
//# sourceMappingURL=work-order-history.controller.js.map