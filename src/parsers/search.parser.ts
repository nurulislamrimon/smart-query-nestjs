import { SmartQueryConfig } from '../interfaces';

interface SearchCondition {
  OR: Record<string, { contains: string; mode: string }>[];
}

export function buildSearchConditions(
  searchTerm: string | undefined,
  config: SmartQueryConfig,
): SearchCondition | null {
  if (!searchTerm || typeof searchTerm !== 'string' || !searchTerm.trim()) {
    return null;
  }

  const trimmedTerm = searchTerm.trim();
  const searchableFieldsSet = new Set(config.searchableFields);

  const conditions: Record<string, { contains: string; mode: string }>[] = [];

  for (const field of config.searchableFields) {
    if (searchableFieldsSet.has(field)) {
      conditions.push({ [field]: { contains: trimmedTerm, mode: 'insensitive' } });
    }
  }

  if (conditions.length === 0) {
    return null;
  }

  return { OR: conditions };
}
