#!/usr/bin/env node

/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

require('dotenv/config');

const fs = require('fs');
const path = require('path');

const { requireEnv, Script, getEnvVarOrDefault } = require('@tupaia/utils');

class RefreshDatabaseScript extends Script {
  config = {
    command: '* <dumpPath>',
    options: {
      migrate: {
        alias: 'm',
        type: 'boolean',
        description: 'Run migrations after DB has been refreshed',
      },
      root: {
        alias: 'r',
        type: 'string',
        description: 'Root for provided paths (relative to packages/database)',
      },
      gis: {
        alias: 'g',
        default: true,
        type: 'boolean',
        description: 'Create postgis extension',
      },
    },
    version: '1.0.0',
  };

  runCommands() {
    this.refreshDatabase();
    if (this.args.migrate) {
      this.runMigrations();
    }
  }

  refreshDatabase() {
    const dbName = requireEnv('DB_NAME');
    const dbUser = requireEnv('DB_USER');
    const dbPgUser = requireEnv('DB_PG_USER');
    const dbPort = getEnvVarOrDefault('DB_PORT', 5432);
    const dbHost = getEnvVarOrDefault('DB_HOST', 'localhost');


    this.logInfo(`Refreshing the ${dbName} database (owner: ${dbUser})...`);

    const dumpPath = this.resolvePath(this.args.dumpPath);
    if (!fs.existsSync(dumpPath)) {
      throw new Error(`Dump file path "${dumpPath}" does not exist"`);
    }

    this.verifyPsql();
    const dbArgs = { user: dbPgUser, port: dbPort, host: dbHost };
    this.execDbCommand(`DROP DATABASE IF EXISTS ${dbName}`, dbArgs);
    this.execDbCommand(`CREATE DATABASE ${dbName} WITH OWNER ${dbUser}`, dbArgs);
    // Loading GIS extension is optional - it's already loaded when using
    // postgis/postgis Docker container
    if (this.args.gis) {
      this.execDbCommand('CREATE EXTENSION postgis', dbArgs);
    }
    this.execDbCommand(`ALTER USER ${dbUser} WITH SUPERUSER`, dbArgs);
    this.exec(`psql -U ${dbUser} -d ${dbName} -h "${dbHost}" -p ${dbPort} -f "${dumpPath}"`);
    this.execDbCommand(`ALTER USER ${dbUser} WITH NOSUPERUSER`, dbArgs);
  }

  resolvePath = relativePath =>
    path.resolve([this.args.root, relativePath].filter(x => !!x).join('/'));

  execDbCommand = (dbCommand, { user, db, host, port } = {}) => {
    const parts = ['psql'];
    if (user) {
      parts.push('-U', user);
    } else if (this.isOsWindows()) {
      // `psql` in Windows requires a user to be specified
      parts.push('-U', 'postgres');
    }
    if (db) {
      parts.push('-d', db);
    }

    if (host) {
      parts.push('-h', host);
    }
    if (port) {
      parts.push('-p', port);
    }
    parts.push('-c', `"${dbCommand}"`);

    this.exec(parts.join(' '));
  };

  verifyPsql() {
    try {
      this.exec('psql --version');
    } catch (error) {
      this.logError('No PostgreSQL installation found');
      this.exit(false);
    }
  }

  runMigrations() {
    this.exec('yarn migrate');
  }
}

new RefreshDatabaseScript().run();
