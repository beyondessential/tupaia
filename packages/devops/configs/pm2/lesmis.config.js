const { startDevConfigs } = require('./base.config');
const packages = require('../server-stacks.json').lesmis;

module.exports = {
  apps: startDevConfigs(packages),
};
