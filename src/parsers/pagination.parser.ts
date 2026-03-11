import { PaginationOptions } from '../interfaces';
import { SmartQueryConfig } from '../interfaces/smart-query-config.interface';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export function parsePagination(
  query: Record<string, unknown>,
  config: SmartQueryConfig,
): PaginationOptions {
  const pageParam = query.page;
  const limitParam = query.limit;
  const sortByParam = query.sortBy;
  const sortOrderParam = query.sortOrder;

  const maxLimit = config.maxLimit ?? 100;
  const defaultLimit = config.defaultLimit ?? DEFAULT_LIMIT;

  const page = parsePositiveInteger(pageParam) ?? DEFAULT_PAGE;
  const limit = clampLimit(
    parsePositiveInteger(limitParam) ?? defaultLimit,
    defaultLimit,
    maxLimit,
  );
  const skip = (page - 1) * limit;

  let sortBy = 'id';
  if (typeof sortByParam === 'string' && sortByParam.trim()) {
    sortBy = sortByParam.trim();
  }

  let sortOrder: 'asc' | 'desc' = 'asc';
  if (typeof sortOrderParam === 'string') {
    const normalized = sortOrderParam.toLowerCase();
    if (normalized === 'desc' || normalized === 'asc') {
      sortOrder = normalized;
    }
  }

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
}

function parsePositiveInteger(value: unknown): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const num = typeof value === 'number' ? value : Number(value);

  if (!Number.isInteger(num) || num < 1) {
    return null;
  }

  return num;
}

function clampLimit(value: number, defaultLimit: number, maxLimit: number): number {
  if (value < 1) {
    return defaultLimit;
  }
  if (value > maxLimit) {
    return maxLimit;
  }
  return value;
}
