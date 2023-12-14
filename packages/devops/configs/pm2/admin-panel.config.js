/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

const { startDevConfigs } = require("./base.config");

module.exports = {
  apps: startDevConfigs([
    "central-server",
    "entity-server",
    "report-server",
    "data-table-server",
    "admin-panel-server",
    "admin-panel",
  ])
};