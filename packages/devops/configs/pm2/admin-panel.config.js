const { startDevConfigs } = require('./base.config');
const packages = require('../server-stacks.json')['admin-panel'];

module.exports = {
  apps: startDevConfigs(packages),
};
