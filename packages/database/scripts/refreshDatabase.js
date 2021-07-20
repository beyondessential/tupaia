#!/usr/bin/env node

/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const { Script } = require('@tupaia/utils');

class RefreshDatabaseScript extends Script {
  config = {
    command: '* <dumpPath>',
    options: {
      database: {
        alias: 'd',
        type: 'string',
        description: 'Database name (default: tupaia)',
      },
      migrate: {
        alias: 'm',
        type: 'boolean',
        description: 'Run migrations after DB has been refreshed',
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
    this.logInfo('Refreshing the tupaia database...');

    this.verifyPsql();
    const dbName = this.args.database || 'tupaia';
    this.execDbCommand(`DROP DATABASE IF EXISTS ${dbName}`);
    this.execDbCommand(`CREATE DATABASE ${dbName} WITH OWNER tupaia`);
    this.execDbCommand('CREATE EXTENSION postgis', { db: dbName });
    this.execDbCommand('ALTER USER tupaia WITH SUPERUSER');
    this.exec(`psql -U tupaia -d ${dbName} -f "${this.args.dumpPath}"`); // Relative to the repo root
    this.execDbCommand('ALTER USER tupaia WITH NOSUPERUSER', { user: 'tupaia' });
  }

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
