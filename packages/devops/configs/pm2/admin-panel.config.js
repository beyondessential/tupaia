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