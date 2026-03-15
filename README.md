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

## Architecture

This library follows a two-level configuration architecture:

1. **Global Configuration** (`SmartQueryModule.forRoot()`) - System-level settings that apply globally
2. **Query Options** - Entity-specific settings defined at the interceptor level

### Why This Architecture?

Searchable and filterable fields are **model-specific**. Different entities (User, Product, Order, etc.) require different fields. Defining these globally was poor architecture because:
- You'd need to define all possible fields for all entities in one place
- Adding a new entity required updating the global config
- It's not clear which fields belong to which entity

## Quick Start

### 1. Configure the Module (Global/System Settings)

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

### 2. Use in Controller (Entity-Specific Settings)

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { SmartQueryInterceptor, SmartQuery, buildSmartQuery } from 'smart-query-nestjs';

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

Query options (defined per-entity):
- `searchableFields` - Fields to search when using `searchTerm` parameter
- `filterableFields` - Fields that can be filtered
- `numberFields` - Fields that should be parsed as numbers
- `booleanFields` - Fields that should be parsed as booleans
- `dateFields` - Fields that should be parsed as dates

### Different Entities, Different Options

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

#### SmartQueryConfig

Full configuration (for backward compatibility):

```typescript
interface SmartQueryConfig extends QueryOptions {
  defaultLimit?: number;
  maxLimit?: number;
}
```

#### SmartQueryContext

The context object injected into controllers:

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

[Nurul Islam Rimon](https://github.com/nurulislamrimon)
