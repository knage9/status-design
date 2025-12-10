import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Reviews Stats
        const totalReviews = await this.prisma.review.count();
        const pendingReviewsCount = await this.prisma.review.count({
            where: { status: 'PENDING' },
        });
        const reviewsThisWeek = await this.prisma.review.count({
            where: { dateCreated: { gte: sevenDaysAgo } },
        });
        const avgRatingAgg = await this.prisma.review.aggregate({
            _avg: { rating: true },
        });
        const avgRating = avgRatingAgg._avg.rating || 0;

        // Posts Stats
        const totalPosts = await this.prisma.post.count();
        const draftPosts = await this.prisma.post.count({
            where: { status: 'DRAFT' },
        });
        const postsThisWeek = await this.prisma.post.count({
            where: { dateCreated: { gte: sevenDaysAgo } },
        });

        // Portfolio Stats
        const totalPortfolio = await this.prisma.portfolioItem.count();
        const draftPortfolio = await this.prisma.portfolioItem.count({
            where: { status: 'DRAFT' },
        });
        const portfolioThisWeek = await this.prisma.portfolioItem.count({
            where: { date: { gte: sevenDaysAgo } },
        });

        // Requests Stats
        const totalRequests = await this.prisma.request.count();
        const newRequests = await this.prisma.request.count({
            where: { status: 'NEW' },
        });
        const requestsThisWeek = await this.prisma.request.count({
            where: { createdAt: { gte: sevenDaysAgo } },
        });

        // Pending Reviews List
        const pendingReviews = await this.prisma.review.findMany({
            where: { status: 'PENDING' },
            orderBy: { dateCreated: 'desc' },
        });

        // Top Services (Group By)
        // Prisma groupBy for 'service'
        const topServicesGrouped = await this.prisma.review.groupBy({
            by: ['service'],
            _count: {
                service: true,
            },
            orderBy: {
                _count: {
                    service: 'desc',
                },
            },
            take: 3,
        });

        const topServices = topServicesGrouped.map((item) => ({
            service: item.service,
            count: item._count.service,
        }));

        // Activity Chart (Last 7 days)
        // We need to aggregate counts per day.
        // Since Prisma doesn't support date truncation easily in groupBy without raw query,
        // and we only need last 7 days, we can fetch data or use raw query.
        // For simplicity and database independence (though using Postgres), let's fetch items from last 7 days and aggregate in JS.
        // Or simpler: execute 3 queries for reviews, posts, portfolio for last 7 days.

        const reviewsLast7Days = await this.prisma.review.findMany({
            where: { dateCreated: { gte: sevenDaysAgo } },
            select: { dateCreated: true },
        });
        const postsLast7Days = await this.prisma.post.findMany({
            where: { dateCreated: { gte: sevenDaysAgo } },
            select: { dateCreated: true },
        });
        const portfolioLast7Days = await this.prisma.portfolioItem.findMany({
            where: { date: { gte: sevenDaysAgo } },
            select: { date: true },
        });

        const activityChart: { date: string; reviews: number; posts: number; portfolio: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

            const reviewsCount = reviewsLast7Days.filter(r => r.dateCreated.toISOString().startsWith(dateStr)).length;
            const postsCount = postsLast7Days.filter(p => p.dateCreated.toISOString().startsWith(dateStr)).length;
            const portfolioCount = portfolioLast7Days.filter(p => p.date.toISOString().startsWith(dateStr)).length;

            activityChart.push({
                date: dateStr,
                reviews: reviewsCount,
                posts: postsCount,
                portfolio: portfolioCount,
            });
        }

        return {
            stats: {
                reviews: {
                    total: totalReviews,
                    pending: pendingReviewsCount,
                    avgRating: Number(avgRating.toFixed(1)),
                    thisWeek: reviewsThisWeek,
                },
                posts: {
                    total: totalPosts,
                    draft: draftPosts,
                    thisWeek: postsThisWeek,
                },
                portfolio: {
                    total: totalPortfolio,
                    draft: draftPortfolio,
                    thisWeek: portfolioThisWeek,
                },
                requests: {
                    total: totalRequests,
                    new: newRequests,
                    thisWeek: requestsThisWeek,
                },
            },
            pendingReviews,
            topServices,
            activityChart,
        };
    }
}
