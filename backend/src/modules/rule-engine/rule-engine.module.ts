import { Module } from '@nestjs/common';
import { RuleEngineService } from './rule-engine.service';
import { RuleConfigModule } from './rule-config/rule-config.module';

@Module({
  imports: [
    RuleConfigModule, // 👈 để RuleEngine dùng RuleConfigService (khi cần)
  ],
  providers: [RuleEngineService],
  exports: [RuleEngineService], // 👈 BẮT BUỘC để module khác inject
})
export class RuleEngineModule {}
