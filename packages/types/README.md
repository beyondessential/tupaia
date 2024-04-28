# @tupaia/types

The @tupaia/types package represents the typings for all Tupaia models for reuse across the monorepo.

## Types

Models are generated from the db schema, run `yarn generate:models` to update this after changes to the db schema.

### Json type columns

Json type columns (typically named "config" in Tupaia) need to be specified manually:

1. Write the Type Definition and place it under models-extra e.g. ReportConfig for column report.config
2. Override the type in `./config/models/config.json` under `typeOverrides` e.g. `"public.report.config": "ReportConfig"`
3. Import the type at the top of `models.ts` by specifying the import in config under `custom` > `imports` e.g. `"ReportConfig": "./models-extra"`

### Geography type columns

Geography type columns, for example, 'bounds', 'region' etc are set to generate as strings, otherwise they become 'any' which meeds to be overwritten in individual packages. This is handled in `typeMap`

All config options here: https://rmp135.github.io/sql-ts

## Schemas

Json schemas are automatically generated for all exported types. Run `yarn generate:schemas` to update this after a type is changed.
