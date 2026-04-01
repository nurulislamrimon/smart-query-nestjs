import { SmartQueryContext } from '../interfaces';

export interface BuildSmartQueryOptions {
  where?: Record<string, unknown>;
  orderBy?: Record<string, 'asc' | 'desc'>[];
  skip?: number;
  take?: number;
}

export type BuiltSmartQuery = Pick<
  SmartQueryContext,
  'where' | 'orderBy' | 'skip' | 'take'
>;

export function buildSmartQuery(
  context: SmartQueryContext,
  ...extraConditions: Record<string, unknown>[]
): BuiltSmartQuery {
  const { where, orderBy, skip, take } = context;

  let finalWhere: Record<string, unknown> = where as Record<string, unknown>;

  if (extraConditions.length === 1) {
    finalWhere = { AND: [where, extraConditions[0]] };
  } else if (extraConditions.length > 1) {
    finalWhere = { AND: [where, ...extraConditions] };
  }

  const finalOrderBy = orderBy.length > 0 ? orderBy : [];

  return {
    where: finalWhere,
    orderBy: finalOrderBy,
    skip,
    take,
  };
}
