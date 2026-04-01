export interface PrismaQuery<TWhere = unknown, TOrderBy = Record<string, 'asc' | 'desc'>> {
  where: TWhere;
  orderBy: TOrderBy[];
  skip: number;
  take: number;
}

export interface SmartQueryMeta {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
}

export interface SmartQueryPagination {
  skip: number;
  take: number;
}

export type SmartQueryResult<
  TWhere = unknown,
  TOrderBy = Record<string, 'asc' | 'desc'>
> = PrismaQuery<TWhere, TOrderBy> & SmartQueryMeta;
