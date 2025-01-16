const { startDevConfigs } = require("./base.config");

module.exports = {
  apps: startDevConfigs([
    "central-server",
    "entity-server",
    "report-server",
    "web-config-server",
    "data-table-server",
    "tupaia-web-server",
    "tupaia-web",
  ])
};