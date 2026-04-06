# Changelog

All notable changes to this project will be documented in this file.

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