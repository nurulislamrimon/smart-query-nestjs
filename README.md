# smart-query-nestjs

[![npm version](https://img.shields.io/npm/v/smart-query-nestjs.svg)](https://www.npmjs.com/package/smart-query-nestjs)
[![NestJS v11](https://img.shields.io/badge/NestJS-v11-blue)](https://nestjs.com)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A high-performance, ORM-agnostic NestJS library for search, filtering, pagination, and sorting in REST APIs.

## Features

- **Global Search** - Search across multiple fields with a single query parameter
- **Field Filtering** - Filter by exact match, contains, startsWith, endsWith
- **Range Filtering** - Greater than, less than, greater or equal, less or equal
- **Array Filtering** - IN queries for multiple values
- **Nested Relation Filtering** - Filter by related entity fields
- **Pagination** - Page-based pagination with configurable limits
- **Multi-field Sorting** - Sort by multiple fields with ascending/descending order
- **Prisma-optimized Queries** - Returns Prisma-compatible orderBy arrays
- **Type-safe Query Results** - Full TypeScript generics support
- **ORM Agnostic** - Generates query objects compatible with any database layer (Prisma, TypeORM, etc.)
- **High Performance** - Optimized parsing with single query parse and O(1) field lookups

## Installation

```bash
npm install smart-query-nestjs
```

### Requirements

- NestJS v9, v10, or v11
- TypeScript 5.0+

## Quick Start

### 1. Configure the Module (Optional - Global Settings)

```typescript
import { Module } from '@nestjs/common';
import { SmartQueryModule } from 'smart-query-nestjs';

@Module({
  imports: [
    SmartQueryModule.forRoot({
      defaultLimit: 10,
      maxLimit: 100,
    }),
  ],
})
export class AppModule {}
```

Global configuration options:
- `defaultLimit` - Default number of items per page (default: 10)
- `maxLimit` - Maximum allowed items per page (default: 100)

### 2. Use in Controller

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { SmartQueryInterceptor, SmartQuery, buildSmartQuery, SmartQueryResult } from 'smart-query-nestjs';
import { Prisma } from '@prisma/client';

@Controller('customers')
export class CustomerController {
  @Get()
  @UseInterceptors(new SmartQueryInterceptor({
    searchableFields: ['full_name', 'email'],
    filterableFields: ['full_name', 'email', 'is_active', 'status', 'shop_id', 'age'],
    numberFields: ['age'],
    booleanFields: ['is_active'],
    dateFields: ['created_at'],
  }))
  async findAll(@SmartQuery() query: SmartQueryResult<Prisma.CustomerWhereInput>) {
    const { where, orderBy, pagination } = query;

    const dbQuery = buildSmartQuery(query, {
      shop_id: user.tenant_id,
    });

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where: dbQuery.where,
        orderBy: dbQuery.orderBy,
        skip: dbQuery.skip,
        take: dbQuery.take,
      }),
      this.prisma.customer.count({ where: dbQuery.where }),
    ]);

    return { data, total };
  }
}
```

> **Auto-Response Transformation**: If your endpoint returns `{ data, total }`, the interceptor automatically enhances the response with pagination metadata:
> ```json
> { "data": [...], "total": 100, "pagination": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 } }
> ```

Query options (defined per-entity):
- `searchableFields` - Fields to search when using `searchTerm` parameter
- `filterableFields` - Fields that can be filtered
- `numberFields` - Fields that should be parsed as numbers
- `booleanFields` - Fields that should be parsed as booleans
- `dateFields` - Fields that should be parsed as dates

## Supported Query Formats

### Global Search

Search across all searchable fields:

```
GET /customers?searchTerm=john
```

### Field Filtering

Exact match filtering:

```
GET /customers?full_name=John
GET /customers?is_active=true
```

### Range Filtering

Filter by numeric or date ranges:

```
GET /customers?price[gte]=10&price[lte]=100
GET /customers?created_at[gte]=2024-01-01
GET /customers?age[gt]=18
```

Operators: `gte`, `gt`, `lte`, `lt`

### Array Filtering (IN Query)

Filter by multiple values:

```
GET /customers?status[]=pending&status[]=approved
GET /customers?status=pending,approved
```

### Nested Relation Filtering

Filter by related entity fields:

```
GET /customers?shop.id=10
GET /customers?shop.name=MyShop
```

### Pagination

```
GET /customers?page=2&limit=20
```

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

### Sorting

#### New Multi-field Syntax (Recommended)

```
GET /customers?sort=name,-createdAt
```

- `name` → ascending
- `-createdAt` → descending
- Comma-separated values for multiple sort fields

Generated Prisma query:

```ts
orderBy: [
  { name: 'asc' },
  { createdAt: 'desc' }
]
```

#### Legacy Syntax (Backward Compatible)

**Single field:**
```
GET /customers?sortBy=created_at&sortOrder=desc
```

**Multi-field:**
```
GET /customers?sortBy=createdAt,firstName&sortOrder=desc,asc
```

- `sortBy`: Comma-separated fields to sort by
- `sortOrder`: Comma-separated order values (`asc` or `desc`), defaults to `asc`

## Combined Example

```
GET /customers?searchTerm=john&status[]=active&age[gte]=18&page=1&limit=20&sort=name,-createdAt
```

This query will:
- Search for "john" in all searchable fields
- Filter by status "active"
- Filter by age >= 18
- Return page 1 with 20 items per page
- Sort by name ascending, then by createdAt descending

## TypeScript Support

### SmartQueryResult Type

The package exports `SmartQueryResult<TWhere, TOrderBy>` for full TypeScript support:

```typescript
import { SmartQuery, SmartQueryResult, SmartQueryInterceptor } from 'smart-query-nestjs';
import { Prisma } from '@prisma/client';

@Controller('customers')
export class CustomerController {
  @Get()
  @UseInterceptors(new SmartQueryInterceptor({
    searchableFields: ['full_name', 'email'],
    filterableFields: ['full_name', 'email', 'is_active', 'status'],
  }))
  async findAll(
    @SmartQuery() query: SmartQueryResult<
      Prisma.CustomerWhereInput,
      Prisma.CustomerOrderByWithRelationInput
    >
  ) {
    const { where, orderBy, pagination } = query;
    // where: Prisma.CustomerWhereInput
    // orderBy: Prisma.CustomerOrderByWithRelationInput[]
    // pagination: { page, limit, skip }

    return this.prisma.customer.findMany({
      where,
      orderBy,
      skip: pagination.skip,
      take: pagination.limit,
    });
  }
}
```

#### SmartQueryPagination

```typescript
interface SmartQueryPagination {
  page: number;
  limit: number;
  skip: number;
}
```

#### SmartQueryResult

```typescript
type SmartQueryResult<
  TWhere = unknown,
  TOrderBy = Record<string, 'asc' | 'desc'>
> = {
  where: TWhere;
  orderBy: TOrderBy[];
  pagination: SmartQueryPagination;
};
```

## API Reference

### Interfaces

#### SmartQueryModuleOptions

Global configuration options for `SmartQueryModule.forRoot()`:

```typescript
interface SmartQueryModuleOptions {
  defaultLimit?: number;
  maxLimit?: number;
}
```

#### QueryOptions

Entity-specific query options for interceptor:

```typescript
interface QueryOptions {
  searchableFields?: string[];
  filterableFields?: string[];
  numberFields?: string[];
  booleanFields?: string[];
  dateFields?: string[];
}
```

#### SmartQueryInterceptorOptions

Options for the SmartQueryInterceptor (extends QueryOptions):

```typescript
interface SmartQueryInterceptorOptions extends QueryOptions {
  defaultLimit?: number;
  maxLimit?: number;
}
```

#### SmartQueryConfig

Full configuration (for backward compatibility):

```typescript
interface SmartQueryConfig extends QueryOptions {
  defaultLimit?: number;
  maxLimit?: number;
}
```

#### PaginationOptions

```typescript
interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
```

#### SmartQueryContext

Internal context object attached to the request:

```typescript
interface SmartQueryContext {
  where: Record<string, unknown>;
  orderBy: Record<string, 'asc' | 'desc'>[];
  pagination: PaginationOptions;
}
```

#### BuiltSmartQuery

Return type of `buildSmartQuery()`:

```typescript
interface BuiltSmartQuery {
  where: Record<string, unknown>;
  orderBy: Record<string, 'asc' | 'desc'>[];
  skip: number;
  take: number;
  page: number;
}
```

### Decorators

#### @SmartQuery()

Extracts the SmartQueryResult from the request.

```typescript
@Get()
async findAll(@SmartQuery() query: SmartQueryResult) {
  const { where, orderBy, pagination } = query;
  // ...
}
```

### Classes

#### SmartQueryInterceptor

NestJS interceptor for parsing query parameters.

```typescript
@UseInterceptors(new SmartQueryInterceptor({
  searchableFields: ['name', 'email'],
  filterableFields: ['name', 'email', 'status'],
}))
```

### Functions

#### buildSmartQuery(context, ...extraConditions)

Merges the smart query context with additional conditions and generates a database query object.

```typescript
const result = buildSmartQuery(query, { shop_id: 1 });
// Returns: { where, orderBy, skip, take, page }
```

#### createSmartQueryInterceptor(config)

Factory function to create a SmartQueryInterceptor with specific options.

```typescript
const interceptor = createSmartQueryInterceptor({
  searchableFields: ['title', 'description'],
  filterableFields: ['category', 'price', 'status'],
  numberFields: ['price'],
});
```

### Utility Functions

#### parseQueryString(queryString)

Parses a query string into an object.

```typescript
const parsed = parseQueryString('page=1&limit=10&searchTerm=foo');
// Returns: { page: 1, limit: 10, searchTerm: 'foo' }
```

#### pick(obj, keys)

Pick specific keys from an object.

```typescript
const picked = pick(user, ['id', 'name', 'email']);
// Returns: { id: ..., name: ..., email: ... }
```

### Parsers

#### parseFilters(parsedQuery, config)

Parses filter parameters from the query string.

#### buildSearchConditions(searchTerm, config)

Builds search conditions for the searchTerm parameter.

#### parsePagination(parsedQuery, config)

Parses pagination parameters (page, limit).

#### parseSort(sort, sortBy, sortOrder)

Parses sorting parameters.

## Performance Optimizations

The library includes several performance optimizations:

1. **Single Query Parse** - Uses `qs.parse` with `allowDots: true` to parse the query string only once
2. **O(1) Field Lookups** - Uses `Set` for field lookups instead of array includes
3. **Modular Architecture** - Separates concerns into dedicated parsers
4. **No Unnecessary Cloning** - Avoids deep object cloning where possible

## Different Entities, Different Options

Each controller/entity can have its own configuration:

```typescript
// For Customers
@UseInterceptors(new SmartQueryInterceptor({
  searchableFields: ['full_name', 'email'],
  filterableFields: ['full_name', 'email', 'status', 'shop_id'],
}))

// For Products  
@UseInterceptors(new SmartQueryInterceptor({
  searchableFields: ['name', 'description', 'sku'],
  filterableFields: ['name', 'category', 'price', 'is_active'],
  numberFields: ['price', 'stock'],
}))

// For Orders
@UseInterceptors(new SmartQueryInterceptor({
  searchableFields: ['order_number'],
  filterableFields: ['status', 'customer_id', 'total'],
  numberFields: ['total'],
  dateFields: ['created_at'],
}))
```

## Architecture

This library follows a two-level configuration architecture:

1. **Global Configuration** (`SmartQueryModule.forRoot()`) - System-level settings that apply globally
2. **Query Options** - Entity-specific settings defined at the interceptor level

### Why This Architecture?

Searchable and filterable fields are **model-specific**. Different entities (User, Product, Order, etc.) require different fields. Defining these globally was poor architecture because:
- You'd need to define all possible fields for all entities in one place
- Adding a new entity required updating the global config
- It's not clear which fields belong to which entity

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

[Nurul Islam Rimon](https://github.com/nurulislamrimon)
