export interface SmartQueryPagination {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export type SmartQueryResult<TWhere = unknown> = {
  where: TWhere;
  pagination: SmartQueryPagination;
};
