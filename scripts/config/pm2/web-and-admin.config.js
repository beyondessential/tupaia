/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

const commonConfig = {
  "error_file"  : null,
  "out_file"    : null,
  "wait_ready"  : false, // don't wait for one process to finish starting before starting next
}

module.exports = {
  apps : [
    {
      "name"        : "admin-panel-server",
      "script"      : "yarn workspace @tupaia/admin-panel-server start-dev",
      ...commonConfig,
    },
    {
      "name"        : "admin-panel",
      "script"      : "yarn workspace @tupaia/admin-panel start-dev",
      ...commonConfig,
    },
    {
      "name"        : "central-server",
      "script"      : "yarn workspace @tupaia/central-server start-dev",
      ...commonConfig,
    },
    {
      "name"        : "entity-server",
      "script"      : "yarn workspace @tupaia/entity-server start-dev",
      ...commonConfig,
    },
    {
      "name"        : "report-server",
      "script"      : "yarn workspace @tupaia/report-server start-dev",
      ...commonConfig,
    },
    {
      "name"        : "data-table-server",
      "script"      : "yarn workspace @tupaia/data-table-server start-dev",
      ...commonConfig,
    },
    {
      "name"        : "web-config-server",
      "script"      : "yarn workspace @tupaia/web-config-server start-dev",
      ...commonConfig,
    },
    {
      "name"        : "web-frontend",
      "script"      : "yarn workspace @tupaia/web-frontend start-dev",
      ...commonConfig,
    },
  ],
};