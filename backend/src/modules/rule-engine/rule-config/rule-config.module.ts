import { Module } from '@nestjs/common';
import { RuleConfigService } from './rule-config.service';
import { PrismaModule } from '../../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RuleConfigService],
  exports: [RuleConfigService],
})
export class RuleConfigModule {}
