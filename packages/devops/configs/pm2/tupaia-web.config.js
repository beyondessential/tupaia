/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

const { serverStartDevConfigs } = require("./base.config");

module.exports = {
  apps: serverStartDevConfigs([
    "central-server",
    "entity-server",
    "report-server",
    "web-config-server",
    "data-table-server",
    "tupaia-web-server",
    "tupaia-web",
  ])
};