import { PaginationOptions } from './pagination-options.interface';

export interface SmartQueryContext {
  where: Record<string, unknown>;
  pagination: PaginationOptions;
}
