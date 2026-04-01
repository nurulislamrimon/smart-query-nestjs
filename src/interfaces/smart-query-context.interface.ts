import { PaginationOptions } from './pagination-options.interface';

export interface SmartQueryContext {
  where: Record<string, unknown>;
  orderBy: Record<string, 'asc' | 'desc'>[];
  pagination: PaginationOptions;
  page: number;
  limit: number;
}
