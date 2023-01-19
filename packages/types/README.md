## Type definitions for Tupaia objects

Models are generated from the db schema, run `yarn generate:models` to update this after changes to the db schema.

### Configuring

Json type columns (typically named config in Tupaia) need to be specified manually:
  1. Write the Type Definition and place it under models-extra e.g. ReportConfig for column report.config
  2. Override the type in config under `typeOverrides` e.g. `"public.report.config": "ReportConfig"`
  3. Import the type at the top of `models.ts` by specifying the import in config under `custom` > `imports` e.g. `"ReportConfig": "./models-extra"`

All config options here: https://rmp135.github.io/sql-ts