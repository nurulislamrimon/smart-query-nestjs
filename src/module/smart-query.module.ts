import { Module, Global, DynamicModule, Provider } from '@nestjs/common';
import { SmartQueryConfig } from '../interfaces';
import { SMART_QUERY_CONFIG } from '../interceptors/smart-query.interceptor';

@Global()
@Module({})
export class SmartQueryModule {
  static forRoot(config: SmartQueryConfig): DynamicModule {
    const configProvider: Provider = {
      provide: SMART_QUERY_CONFIG,
      useValue: config,
    };

    return {
      module: SmartQueryModule,
      providers: [configProvider],
      exports: [configProvider],
    };
  }
}
