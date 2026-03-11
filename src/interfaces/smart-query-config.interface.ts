export interface SmartQueryConfig {
  searchableFields: string[];
  filterableFields: string[];
  numberFields?: string[];
  booleanFields?: string[];
  dateFields?: string[];
  defaultLimit?: number;
  maxLimit?: number;
}
