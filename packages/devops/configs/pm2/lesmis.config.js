const { startDevConfigs } = require('./base.config');

module.exports = {
  apps: startDevConfigs([
    'central-server',
    'entity-server',
    'report-server',
    'lesmis-server',
    'web-config-server',
    'data-table-server',
    'admin-panel-server',
    'lesmis',
  ]),
};
