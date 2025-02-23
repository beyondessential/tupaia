import { PGlite } from '@electric-sql/pglite';
import { CREATE_TABLES_SCRIPT } from './createTableScript';
import generateId from 'uuid/v1';

class PGLiteLoadTester {
  constructor() {
    this.db = new PGlite('idb://my-pgdata');
    this.results = { reads: [], writes: [], concurrentOps: [], errors: [] };
  }

  async initTestTable() {
    try {
      await this.db.exec(CREATE_TABLES_SCRIPT);
    } catch (error) {
      console.error(error);
    } finally {
    }
  }

  async testWrite(iterations, batchSize = 1000) {
    const start = Date.now();

    try {
      for (let i = 0; i < iterations; i++) {
        await this.db.query(
          `
        INSERT INTO survey_response (
            id,
            survey_id, 
            user_id, 
            assessor_name, 
            start_time, 
            end_time, 
            entity_id,
            data_time,
            outdated
        )
        -- SELECT jsonb_build_object
        VALUES (
            '${generateId()}', 
            '62b015be60209041ec00281a', 
            '5f42f7d361f76a559504c0f0',
            'Petelo Manu',
            now(),
            now(),
            '62f17d3b32886b81ec90ee4d',
            now(),
            false
        )
        `,
        );
      }
    } catch (error) {
      this.results.errors.push({ operation: 'write', error: error.message });
      throw error;
    } finally {
    }

    const duration = Date.now() - start;
    const totalOps = iterations * batchSize;
    const opsPerSecond = totalOps / (duration / 1000);
    this.results.writes.push({ iterations, batchSize, duration, totalOps, opsPerSecond });

    return { duration, opsPerSecond };
  }

  async testRead(iterations, batchSize = 1000) {
    const start = Date.now();

    try {
      for (let i = 0; i < iterations; i++) {
        await this.db.query(
          `
          SELECT * FROM survey_response 
          ORDER BY random() 
          LIMIT $1
        `,
          [batchSize],
        );
      }
    } catch (error) {
      this.results.errors.push({ operation: 'read', error: error.message });
      throw error;
    } finally {
    }

    const duration = Date.now() - start;
    const totalOps = iterations * batchSize;
    const opsPerSecond = totalOps / (duration / 1000);
    this.results.reads.push({ iterations, batchSize, duration, opsPerSecond, totalOps });

    return { duration, opsPerSecond };
  }

  async testConcurrentOperations(numClients = 10, operationsPerClient = 100) {
    const start = Date.now();
    const operations = [];

    for (let i = 0; i < numClients; i++) {
      operations.push(
        this.testWrite(operationsPerClient, 100),
        this.testRead(operationsPerClient, 100),
      );
    }

    try {
      await Promise.all(operations);
    } catch (error) {
      this.results.errors.push({ operation: 'concurrent', error: error.message });
      throw error;
    }

    const duration = Date.now() - start;
    const totalOps = numClients * operationsPerClient * 2; // Both reads and writes
    const opsPerSecond = totalOps / (duration / 1000);

    this.results.concurrentOps.push({
      numClients,
      operationsPerClient,
      duration,
      opsPerSecond,
      totalOps,
    });

    return { duration, opsPerSecond };
  }

  async runFullTest() {
    console.log('Initializing test table...');
    await this.initTestTable();

    console.log('Testing write data...');
    await this.testWrite(2000, 1000);

    console.log('Testing read data...');
    await this.testRead(10, 1000);

    console.log('Testing concurrent operations...');
    await this.testConcurrentOperations(10, 100);

    return this.results;
  }
}

// Example usage:
export const runLoadTest = async () => {
  const tester = new PGLiteLoadTester();

  try {
    const results = await tester.runFullTest();
    console.log('Test Results:', JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
};
