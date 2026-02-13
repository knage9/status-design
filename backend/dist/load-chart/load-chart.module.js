"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadChartModule = void 0;
const common_1 = require("@nestjs/common");
const load_chart_controller_1 = require("./load-chart.controller");
const load_chart_service_1 = require("./load-chart.service");
const prisma_module_1 = require("../prisma/prisma.module");
let LoadChartModule = class LoadChartModule {
};
exports.LoadChartModule = LoadChartModule;
exports.LoadChartModule = LoadChartModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [load_chart_controller_1.LoadChartController],
        providers: [load_chart_service_1.LoadChartService],
        exports: [load_chart_service_1.LoadChartService],
    })
], LoadChartModule);
//# sourceMappingURL=load-chart.module.js.map