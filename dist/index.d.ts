import { NestInterceptor, ExecutionContext, CallHandler, DynamicModule } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Global configuration options for SmartQueryModule.
 * Only includes system-level settings that apply to all entities.
 */
interface SmartQueryModuleOptions {
    defaultLimit?: number;
    maxLimit?: number;
}
/**
 * Query-level options for defining entity-specific searchable and filterable fields.
 * These should be defined per-entity/controller, not globally.
 */
interface QueryOptions {
    /** Fields to search when using the searchTerm query parameter */
    searchableFields?: string[];
    /** Fields that can be filtered via query parameters */
    filterableFields?: string[];
    /** Fields that should be parsed as numbers for range filtering */
    numberFields?: string[];
    /** Fields that should be parsed as booleans */
    booleanFields?: string[];
    /** Fields that should be parsed as dates for range filtering */
    dateFields?: string[];
}
/**
 * Full configuration interface.
 * @deprecated Define searchable/filterable fields per-entity using SmartQueryInterceptor options instead.
 */
interface SmartQueryConfig extends QueryOptions {
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
declare function buildSearchConditions(searchTerm: string | undefined, options: QueryOptions): SearchCondition | null;

declare function parseFilters(query: Record<string, unknown>, options: QueryOptions): Record<string, unknown>;

interface PaginationConfig {
    defaultLimit?: number;
    maxLimit?: number;
}
declare function parsePagination(query: Record<string, unknown>, config: PaginationConfig): PaginationOptions;

declare const SMART_QUERY_CONFIG = "SMART_QUERY_CONFIG";
/**
 * Options for the SmartQueryInterceptor.
 * These should be defined per-entity/controller to specify which fields are searchable and filterable.
 *
 * @example
 * ```typescript
 * @UseInterceptors(new SmartQueryInterceptor({
 *   searchableFields: ['name', 'email'],
 *   filterableFields: ['role', 'status', 'age'],
 *   numberFields: ['age'],
 *   booleanFields: ['isActive'],
 * }))
 * ```
 */
interface SmartQueryInterceptorOptions extends QueryOptions {
    /** Override default limit for this specific endpoint */
    defaultLimit?: number;
    /** Override max limit for this specific endpoint */
    maxLimit?: number;
}
declare class SmartQueryInterceptor implements NestInterceptor {
    private readonly config;
    constructor(interceptorOptions?: SmartQueryInterceptorOptions, globalConfig?: SmartQueryConfig);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
/**
 * Factory function to create a SmartQueryInterceptor with specific options.
 * Use this when you need to create the interceptor programmatically.
 *
 * @param config - Entity-specific query options
 * @returns Configured SmartQueryInterceptor instance
 *
 * @example
 * ```typescript
 * const interceptor = createSmartQueryInterceptor({
 *   searchableFields: ['title', 'description'],
 *   filterableFields: ['category', 'price', 'status'],
 *   numberFields: ['price'],
 * });
 * ```
 */
declare function createSmartQueryInterceptor(config: SmartQueryInterceptorOptions): SmartQueryInterceptor;

declare const SmartQuery: (...dataOrPipes: unknown[]) => ParameterDecorator;

interface BuildSmartQueryOptions {
    where?: Record<string, unknown>;
    orderBy?: Record<string, 'asc' | 'desc'>;
    skip?: number;
    take?: number;
}
interface BuiltSmartQuery {
    where: Record<string, unknown>;
    orderBy: Record<string, 'asc' | 'desc'>;
    skip: number;
    take: number;
    page: number;
}
declare function buildSmartQuery(context: SmartQueryContext, ...extraConditions: Record<string, unknown>[]): BuiltSmartQuery;

declare class SmartQueryModule {
    static forRoot(config?: SmartQueryModuleOptions & Partial<SmartQueryConfig>): DynamicModule;
}

interface SmartQueryPagination {
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}
type SmartQueryResult<TWhere = unknown> = {
    where: TWhere;
    pagination: SmartQueryPagination;
};

export { type BuildSmartQueryOptions, type BuiltSmartQuery, type PaginationOptions, type QueryOptions, SMART_QUERY_CONFIG, SmartQuery, type SmartQueryConfig, type SmartQueryContext, SmartQueryInterceptor, type SmartQueryInterceptorOptions, SmartQueryModule, type SmartQueryModuleOptions, type SmartQueryPagination, type SmartQueryResult, buildSearchConditions, buildSmartQuery, createSmartQueryInterceptor, parseFilters, parsePagination, parseQueryString, pick };
