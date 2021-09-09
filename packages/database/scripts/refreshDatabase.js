#!/usr/bin/env node

/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

require('dotenv/config');

const fs = require('fs');
const path = require('path');

const { requireEnv, Script } = require('@tupaia/utils');

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

    this.logInfo(`Refreshing the ${dbName} database (owner: ${dbUser})...`);

    const dumpPath = this.resolvePath(this.args.dumpPath);
    if (!fs.existsSync(dumpPath)) {
      throw new Error(`Dump file path "${dumpPath}" does not exist"`);
    }

    this.verifyPsql();
    this.execDbCommand(`DROP DATABASE IF EXISTS ${dbName}`);
    this.execDbCommand(`CREATE DATABASE ${dbName} WITH OWNER ${dbUser}`);
    this.execDbCommand('CREATE EXTENSION postgis', { db: dbName });
    this.execDbCommand(`ALTER USER ${dbUser} WITH SUPERUSER`);
    this.exec(`psql -U ${dbUser} -d ${dbName} -f "${dumpPath}"`);
    this.execDbCommand(`ALTER USER ${dbUser} WITH NOSUPERUSER`, { user: dbUser });
  }

  resolvePath = relativePath =>
    path.resolve([this.args.root, relativePath].filter(x => !!x).join('/'));

  execDbCommand = (dbCommand, { user, db } = {}) => {
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
