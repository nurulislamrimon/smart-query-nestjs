import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import type { SmartQueryConfig, SmartQueryContext } from '../interfaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { parseQueryString } from '../utils';
import { buildSearchConditions } from '../parsers/search.parser';
import { parseFilters } from '../parsers/filter.parser';
import { parsePagination } from '../parsers/pagination.parser';

export const SMART_QUERY_CONFIG = 'SMART_QUERY_CONFIG';

@Injectable()
export class SmartQueryInterceptor implements NestInterceptor {
  private readonly config: SmartQueryConfig;

  constructor(config: SmartQueryConfig) {
    const defaults: SmartQueryConfig = {
      searchableFields: [],
      filterableFields: [],
      numberFields: [],
      booleanFields: [],
      dateFields: [],
      defaultLimit: 10,
      maxLimit: 100,
    };
    this.config = { ...defaults, ...config };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const queryString = request.url.split('?')[1] || '';

    const parsedQuery = parseQueryString(queryString);

    const searchTerm = parsedQuery.searchTerm as string | undefined;
    const filters = parseFilters(parsedQuery, this.config);
    const searchConditions = buildSearchConditions(searchTerm, this.config);
    const pagination = parsePagination(parsedQuery, this.config);

    const where: Record<string, unknown> = {};

    if (Object.keys(filters).length > 0) {
      Object.assign(where, filters);
    }

    if (searchConditions) {
      Object.assign(where, searchConditions);
    }

    const smartQueryContext: SmartQueryContext = {
      where,
      pagination,
    };

    request.smartQuery = smartQueryContext;

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'data' in data && 'total' in data) {
          return {
            ...data,
            pagination: {
              page: pagination.page,
              limit: pagination.limit,
              total: data.total,
              totalPages: Math.ceil(data.total / pagination.limit),
            },
          };
        }
        return data;
      }),
    );
  }
}

export function createSmartQueryInterceptor(config: SmartQueryConfig): SmartQueryInterceptor {
  return new SmartQueryInterceptor(config);
}
