/**
 * @typedef {import('knex').Knex} Knex
 * @typedef {import('@tupaia/types').ExternalDatabaseConnection} ExternalDatabaseConnection
 */

import knex from 'knex';

import { getEnvVarOrDefault, requireEnv } from '@tupaia/utils';
import { SyncDirections } from '@tupaia/constants';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

const EXT_DB_CONNECTION_ENV_VAR_PREFIX = 'EXT_DB';

export class ExternalDatabaseConnectionRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.EXTERNAL_DATABASE_CONNECTION;

  async executeSql(sql, parameters) {
    const connection = this.model.acquireConnection(this);
    const result = await connection.raw(sql, parameters);
    return result.rows;
  }

  /** @returns {Promise<boolean>} */
  async testConnection() {
    const [{ is_connected: isConnected }] = await this.executeSql('select TRUE as is_connected');
    return isConnected;
  }
}

export class ExternalDatabaseConnectionModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  /**
   * Map of active external connections that have been established.
   * @privateRemarks Using singleton pattern to avoid individual instances overwhelming the external
   * databases with requests.
   * @type {Record<ExternalDatabaseConnection['id'], Knex>}
   */
  activeConnections = {};

  get DatabaseRecordClass() {
    return ExternalDatabaseConnectionRecord;
  }

  async update(whereCondition, fieldsToUpdate) {
    // Clear connections before updating the records
    const connectionsToUpdate = await this.find(whereCondition);
    await Promise.all(connectionsToUpdate.map(connection => this.closeConnection(connection)));

    await super.update(whereCondition, fieldsToUpdate);
  }

  async delete(whereConditions) {
    // Clear connections before deleting the records
    const connectionsToDelete = await this.find(whereConditions);
    await Promise.all(connectionsToDelete.map(connection => this.closeConnection(connection)));

    await super.delete(whereConditions);
  }

  acquireConnection(externalDatabaseConnectionType) {
    const { id: connectionId, code } = externalDatabaseConnectionType;
    const establishedConnection = this.activeConnections[connectionId];
    if (establishedConnection) {
      return establishedConnection;
    }

    const host = requireEnv(`${EXT_DB_CONNECTION_ENV_VAR_PREFIX}_${code}_HOST`);
    const port = getEnvVarOrDefault(`${EXT_DB_CONNECTION_ENV_VAR_PREFIX}_${code}_PORT`, 5432);
    const database = requireEnv(`${EXT_DB_CONNECTION_ENV_VAR_PREFIX}_${code}_DATABASE`);
    const user = requireEnv(`${EXT_DB_CONNECTION_ENV_VAR_PREFIX}_${code}_USER`);
    const password = requireEnv(`${EXT_DB_CONNECTION_ENV_VAR_PREFIX}_${code}_PASSWORD`);

    const connection = knex({
      client: 'pg',
      connection: {
        host,
        port,
        database,
        user,
        password,
      },
    });
    this.activeConnections[connectionId] = connection;
    return connection;
  }

  async closeConnection(externalDatabaseConnectionType) {
    const { id: connectionId } = externalDatabaseConnectionType;
    const existingConnection = this.activeConnections[connectionId];
    if (existingConnection) {
      await existingConnection.destroy();
      delete this.activeConnections[connectionId];
    }
  }
}
