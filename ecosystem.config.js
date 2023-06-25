/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

module.exports = {
  apps : [
    {
      "name"        : "central-server",
      "script"      : "yarn workspace @tupaia/central-server start-dev",
    },
    {
      "name"        : "web-config-server",
      "script"      : "yarn workspace @tupaia/web-config-server start-dev",
    },
    {
      "name"        : "entity-server",
      "script"      : "yarn workspace @tupaia/entity-server start-dev",
    },
    {
      "name"        : "report-server",
      "script"      : "yarn workspace @tupaia/report-server start-dev",
    },
    {
      "name"        : "data-table-server",
      "script"      : "yarn workspace @tupaia/data-table-server start-dev",
    },
    {
      "name"        : "admin-panel-server",
      "script"      : "yarn workspace @tupaia/admin-panel-server start-dev",
    },
    {
      "name"        : "admin-panel",
      "script"      : "yarn workspace @tupaia/admin-panel start-dev",
    },
  ],
};
