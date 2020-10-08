#!/usr/bin/env node

/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const Script = require('./Script');

class RefreshDatabaseScript extends Script {
  config = {
    args: [],
    command: '* <dumpPath>',
    options: {
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

    const [dumpPath] = this.args._; // Relative to the repo root
    this.verifyPsql();
    this.exec('psql -U postgres -c "DROP DATABASE IF EXISTS tupaia"');
    this.exec('psql -U postgres -c "CREATE DATABASE tupaia WITH OWNER tupaia"');
    this.exec('psql -U postgres -d tupaia -c "CREATE EXTENSION postgis"');
    this.exec('psql -U postgres -c "ALTER USER tupaia WITH SUPERUSER"');
    this.exec(`psql -U tupaia -f "${dumpPath}"`);
    this.exec('psql -U tupaia -c "ALTER USER tupaia WITH NOSUPERUSER"');
  }

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
