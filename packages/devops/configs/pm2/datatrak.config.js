const { startDevConfigs } = require('./base.config');

module.exports = {
  apps: startDevConfigs([
    'central-server',
    'entity-server',
    'report-server',
    'datatrak-web-server',
    'datatrak-web',
    'web-config-server',
    'sync-server',
  ]),
};
