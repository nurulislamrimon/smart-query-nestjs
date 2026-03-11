# smart-query-nestjs

A high-performance, ORM-agnostic NestJS library for search, filtering, pagination, and sorting in REST APIs.

## Features

- **Global Search** - Search across multiple fields with a single query parameter
- **Field Filtering** - Filter by exact match, contains, startsWith, endsWith
- **Range Filtering** - Greater than, less than, greater or equal, less or equal
- **Array Filtering** - IN queries for multiple values
- **Nested Relation Filtering** - Filter by related entity fields
- **Pagination** - Page-based pagination with configurable limits
- **Sorting** - Sort by any field in ascending or descending order
- **ORM Agnostic** - Generates query objects compatible with any database layer (Prisma, TypeORM, etc.)
- **High Performance** - Optimized parsing with single query parse and O(1) field lookups

## Installation

```bash
npm install smart-query-nestjs
```

## Quick Start

### 1. Configure the Module

```typescript
import { Module } from '@nestjs/common';
import { SmartQueryModule } from 'smart-query-nestjs';

@Module({
  imports: [
    SmartQueryModule.forRoot({
      searchableFields: ['full_name', 'email'],
      filterableFields: ['full_name', 'email', 'is_active', 'status', 'shop_id'],
      numberFields: ['age', 'price'],
      booleanFields: ['is_active', 'is_verified'],
      dateFields: ['created_at', 'updated_at'],
      defaultLimit: 10,
      maxLimit: 100,
    }),
  ],
})
export class AppModule {}
```

### 2. Use in Controller

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { SmartQueryInterceptor, SmartQuery, buildSmartQuery } from 'smart-query-nestjs';

const customerQueryConfig = {
  searchableFields: ['full_name', 'email'],
  filterableFields: ['full_name', 'email', 'is_active', 'status', 'shop_id', 'age'],
  numberFields: ['age'],
  booleanFields: ['is_active'],
  dateFields: ['created_at'],
  defaultLimit: 10,
  maxLimit: 100,
};

@Controller('customers')
export class CustomerController {
  @Get()
  @UseInterceptors(new SmartQueryInterceptor(customerQueryConfig))
  async findAll(@SmartQuery() query) {
    const dbQuery = buildSmartQuery(query, {
      shop_id: user.tenant_id,
    });

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany(dbQuery),
      this.prisma.customer.count({ where: dbQuery.where }),
    ]);

    return { data, total };
  }
}
```

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

```
GET /customers?sortBy=created_at&sortOrder=desc
```

- `sortBy`: Field to sort by
- `sortOrder`: `asc` or `desc` (default: asc)

## Combined Example

```
GET /customers?searchTerm=john&status[]=active&age[gte]=18&page=1&limit=20&sortBy=created_at&sortOrder=desc
```

This query will:
- Search for "john" in all searchable fields
- Filter by status "active"
- Filter by age >= 18
- Return page 1 with 20 items per page
- Sort by created_at in descending order

## API Reference

### Interfaces

#### SmartQueryConfig

```typescript
interface SmartQueryConfig {
  searchableFields: string[];
  filterableFields: string[];
  numberFields?: string[];
  booleanFields?: string[];
  dateFields?: string[];
  defaultLimit?: number;
  maxLimit?: number;
}
```

#### SmartQueryContext

```typescript
interface SmartQueryContext {
  where: Record<string, unknown>;
  pagination: PaginationOptions;
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

### Functions

#### buildSmartQuery(context, ...extraConditions)

Merges the smart query context with additional conditions and generates a database query object.

```typescript
const result = buildSmartQuery(query, { shop_id: 1 });
// Returns: { where, orderBy, skip, take, page }
```

### Decorators

#### @SmartQuery()

Extracts the SmartQueryContext from the request.

```typescript
@Get()
async findAll(@SmartQuery() query: SmartQueryContext) {
  // ...
}
```

## Performance Optimizations

The library includes several performance optimizations:

1. **Single Query Parse** - Uses `qs.parse` with `allowDots: true` to parse the query string only once
2. **O(1) Field Lookups** - Uses `Set` for field lookups instead of array includes
3. **Modular Architecture** - Separates concerns into dedicated parsers
4. **No Unnecessary Cloning** - Avoids deep object cloning where possible

## License

MIT
