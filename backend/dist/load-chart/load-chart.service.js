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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadChartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let LoadChartService = class LoadChartService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLoadChart() {
        const workOrders = await this.prisma.workOrder.findMany({
            include: {
                executor: { select: { id: true, name: true } },
                master: { select: { id: true, name: true } },
                manager: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        const stages = {};
        const allStatuses = Object.values(client_1.WorkOrderStatus);
        allStatuses.forEach((status) => {
            stages[status] = [];
        });
        workOrders.forEach((wo) => {
            if (!stages[wo.status]) {
                stages[wo.status] = [];
            }
            stages[wo.status].push({
                id: wo.id,
                orderNumber: wo.orderNumber,
                carBrand: wo.carBrand || '',
                carModel: wo.carModel || '',
                vin: wo.vin,
                customerName: wo.customerName,
                executorName: wo.executor?.name,
                masterName: wo.master?.name,
                managerName: wo.manager?.name,
                totalAmount: wo.totalAmount,
                createdAt: wo.createdAt,
                startedAt: wo.startedAt,
                completedAt: wo.completedAt,
                status: wo.status,
            });
        });
        return { stages };
    }
};
exports.LoadChartService = LoadChartService;
exports.LoadChartService = LoadChartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LoadChartService);
//# sourceMappingURL=load-chart.service.js.map