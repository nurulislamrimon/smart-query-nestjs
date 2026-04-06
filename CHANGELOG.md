# Changelog

All notable changes to this project will be documented in this file.

## [3.2.1] - 2026-04-06

### Fixed
- **filter**: correct operator handling and value parsing for filters (date, boolean, number)
  - Operator objects (`{ lte: value }`) are no longer incorrectly wrapped in `equals`
  - Date fields are properly converted to JavaScript `Date` objects
  - Boolean fields correctly parse string values ('true', 'false', '1', '0', 'yes', 'no')
  - Number fields properly convert string values to numbers

### Added
- Support for direct operator objects in query parameters: `?createdAt[lte]=2026-04-06`

## [3.2.0] - 2026-04-06

### Fixed
- **types**: make `buildSmartQuery` fully generic and type-safe
  - Changed default type from `unknown` to `any` for better inference
  - Added generic `<TWhere = any>` to `buildSmartQuery` function
  - Updated `BuiltSmartQuery` and `BuildSmartQueryOptions` to preserve generics
  - Updated `SmartQueryContext` to use generic `TWhere`

### Added
- Full type inference support for Prisma types
- Backward compatible - no breaking changes