import { SmartQueryMeta, PrismaQuery } from '../types';

export type SmartQueryContext<TWhere = any> = PrismaQuery<TWhere> & SmartQueryMeta;
