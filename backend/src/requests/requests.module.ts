import { Module } from '@nestjs/common';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { RequestNumberService } from './request-number.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [RequestsController],
    providers: [RequestsService, RequestNumberService],
})
export class RequestsModule { }
