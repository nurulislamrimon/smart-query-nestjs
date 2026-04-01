export interface SmartQueryPagination {
  page: number;
  limit: number;
  skip: number;
}

export type SmartQueryResult<
  TWhere = unknown,
  TOrderBy = Record<string, 'asc' | 'desc'>
> = {
  where: TWhere;
  orderBy: TOrderBy[];
  pagination: SmartQueryPagination;
  page: number;
  limit: number;
};
