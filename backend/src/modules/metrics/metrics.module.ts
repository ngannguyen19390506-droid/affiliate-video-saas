import { Module } from '@nestjs/common';
import { ProductMetricsService } from './product-metrics.service';

@Module({
  providers: [ProductMetricsService],
  exports: [ProductMetricsService], // 👈 QUAN TRỌNG
})
export class MetricsModule {}
