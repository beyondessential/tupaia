const { startDevConfigs } = require('./base.config');
const packages = require('../server-stacks.json').psss;

module.exports = {
  apps: startDevConfigs(packages),
};
