#!/usr/bin/env node

/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const Script = require('./Script');

class RefreshDatabaseScript extends Script {
  config = {
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

    this.verifyPsql();
    this.execDbCommand('DROP DATABASE IF EXISTS tupaia');
    this.execDbCommand('CREATE DATABASE tupaia WITH OWNER tupaia');
    this.execDbCommand('CREATE EXTENSION postgis', { db: 'tupaia' });
    this.execDbCommand('ALTER USER tupaia WITH SUPERUSER');
    this.exec(`psql -U tupaia -f "${this.args.dumpPath}"`); // Relative to the repo root
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
