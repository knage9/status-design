import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PostsModule } from './posts/posts.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { UploadsModule } from './uploads/uploads.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RequestsModule } from './requests/requests.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { ExecutorStatsModule } from './executor-stats/executor-stats.module';
import { LoadChartModule } from './load-chart/load-chart.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'admin-client/dist'),
      serveRoot: '/admin',
    }),
    PrismaModule, ReviewsModule, PostsModule, PortfolioModule, UploadsModule, DashboardModule, RequestsModule, AuthModule, UsersModule, WorkOrdersModule, ExecutorStatsModule, LoadChartModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
