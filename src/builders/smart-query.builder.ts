import { SmartQueryContext } from '../interfaces';

export interface BuildSmartQueryOptions {
  where?: Record<string, unknown>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  skip?: number;
  take?: number;
}

export interface SmartQueryResult {
  where: Record<string, unknown>;
  orderBy: Record<string, 'asc' | 'desc'>;
  skip: number;
  take: number;
  page: number;
}

export function buildSmartQuery(
  context: SmartQueryContext,
  ...extraConditions: Record<string, unknown>[]
): SmartQueryResult {
  const { where, pagination } = context;

  let finalWhere: Record<string, unknown>;

  if (extraConditions.length === 0) {
    finalWhere = where;
  } else if (extraConditions.length === 1) {
    finalWhere = { AND: [where, extraConditions[0]] };
  } else {
    finalWhere = { AND: [where, ...extraConditions] };
  }

  const orderBy: Record<string, 'asc' | 'desc'> = {
    [pagination.sortBy]: pagination.sortOrder,
  };

  return {
    where: finalWhere,
    orderBy,
    skip: pagination.skip,
    take: pagination.limit,
    page: pagination.page,
  };
}
