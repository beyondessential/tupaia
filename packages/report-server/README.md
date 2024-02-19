# @tupaia/report-server

Microservice for building reports within Tupaia.

## Reports

A **report** is a set of data that is used to power visualisations, frontends, and data exports in Tupaia.

A report is built by fetching and joining data from underlying data tables, and transforming that data using config-driven transformation functions.

### Transformation functions

The transformation functions approach building a report as a process of manipulating a table of data. The functions are operations that take an existing table and edit it (e.g. `insertColumns`, `excludeRows`, etc.).
