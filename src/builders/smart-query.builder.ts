import { SmartQueryContext } from '../interfaces';

export interface BuildSmartQueryOptions {
  where?: Record<string, unknown>;
  orderBy?: Record<string, 'asc' | 'desc'>[];
  skip?: number;
  take?: number;
}

export interface BuiltSmartQuery {
  where: Record<string, unknown>;
  orderBy: Record<string, 'asc' | 'desc'>[];
  skip: number;
  take: number;
  page: number;
}

export function buildSmartQuery(
  context: SmartQueryContext,
  ...extraConditions: Record<string, unknown>[]
): BuiltSmartQuery {
  const { where, orderBy, pagination } = context;

  let finalWhere: Record<string, unknown>;

  if (extraConditions.length === 0) {
    finalWhere = where;
  } else if (extraConditions.length === 1) {
    finalWhere = { AND: [where, extraConditions[0]] };
  } else {
    finalWhere = { AND: [where, ...extraConditions] };
  }

  const finalOrderBy =
    orderBy.length > 0
      ? orderBy
      : [{ [pagination.sortBy]: pagination.sortOrder }];

  return {
    where: finalWhere,
    orderBy: finalOrderBy,
    skip: pagination.skip,
    take: pagination.limit,
    page: pagination.page,
  };
}
