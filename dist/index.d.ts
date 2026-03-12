import { NestInterceptor, ExecutionContext, CallHandler, DynamicModule } from '@nestjs/common';
import { Observable } from 'rxjs';

interface SmartQueryConfig {
    searchableFields: string[];
    filterableFields: string[];
    numberFields?: string[];
    booleanFields?: string[];
    dateFields?: string[];
    defaultLimit?: number;
    maxLimit?: number;
}

interface PaginationOptions {
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

interface SmartQueryContext {
    where: Record<string, unknown>;
    pagination: PaginationOptions;
}

declare function parseQueryString(queryString: string): Record<string, unknown>;

declare function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;

interface SearchCondition {
    OR: Record<string, {
        contains: string;
        mode: string;
    }>[];
}
declare function buildSearchConditions(searchTerm: string | undefined, config: SmartQueryConfig): SearchCondition | null;

declare function parseFilters(query: Record<string, unknown>, config: SmartQueryConfig): Record<string, unknown>;

declare function parsePagination(query: Record<string, unknown>, config: SmartQueryConfig): PaginationOptions;

declare const SMART_QUERY_CONFIG = "SMART_QUERY_CONFIG";
declare class SmartQueryInterceptor implements NestInterceptor {
    private readonly config;
    constructor(config: SmartQueryConfig);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
declare function createSmartQueryInterceptor(config: SmartQueryConfig): SmartQueryInterceptor;

declare const SmartQuery: (...dataOrPipes: unknown[]) => ParameterDecorator;

interface BuildSmartQueryOptions {
    where?: Record<string, unknown>;
    orderBy?: Record<string, 'asc' | 'desc'>;
    skip?: number;
    take?: number;
}
interface SmartQueryResult {
    where: Record<string, unknown>;
    orderBy: Record<string, 'asc' | 'desc'>;
    skip: number;
    take: number;
    page: number;
}
declare function buildSmartQuery(context: SmartQueryContext, ...extraConditions: Record<string, unknown>[]): SmartQueryResult;

declare class SmartQueryModule {
    static forRoot(config: SmartQueryConfig): DynamicModule;
}

export { type BuildSmartQueryOptions, type PaginationOptions, SMART_QUERY_CONFIG, SmartQuery, type SmartQueryConfig, type SmartQueryContext, SmartQueryInterceptor, SmartQueryModule, type SmartQueryResult, buildSearchConditions, buildSmartQuery, createSmartQueryInterceptor, parseFilters, parsePagination, parseQueryString, pick };
