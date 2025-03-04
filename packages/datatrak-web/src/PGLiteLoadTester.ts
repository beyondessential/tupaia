// @ts-nocheck
import { PGlite } from '@electric-sql/pglite';
import { CREATE_TABLES_SCRIPT, TABLE_INSERT_QUERIES, TABLES } from './loadTestingQueries';
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

  async testWrite(table, totalOps, parameters = [], parameterGenerator = () => []) {
    const start = Date.now();
    try {
      for (let i = 0; i < totalOps; i++) {
        const queryParameters = parameters.length ? parameters : parameterGenerator(i);
        await this.db.query(TABLE_INSERT_QUERIES[table], [generateId(), ...queryParameters]);
      }
    } catch (error) {
      this.results.errors.push({ table, operation: 'write', error: error.message });
      throw error;
    }

    const duration = Date.now() - start;
    const opsPerSecond = totalOps / (duration / 1000);
    this.results.writes.push({ table, duration, totalOps, opsPerSecond });

    return { duration, opsPerSecond };
  }

  async testRead(table, totalOps, limit = 1000) {
    const start = Date.now();

    try {
      for (let i = 0; i < totalOps; i++) {
        await this.db.query(
          `
          SELECT * FROM ${table}
          LIMIT $1
        `,
          [limit],
        );
      }
    } catch (error) {
      this.results.errors.push({ table, operation: 'read', error: error.message });
      throw error;
    } finally {
    }

    const duration = Date.now() - start;
    const opsPerSecond = totalOps / (duration / 1000);
    this.results.reads.push({ table, limit, duration, opsPerSecond, totalOps });

    return { duration, opsPerSecond };
  }

  async runFullTest() {
    console.log('Initializing test table...');
    await this.initTestTable();

    const surveyId = generateId();

    await this.db.query(TABLE_INSERT_QUERIES[TABLES.SURVEY], [surveyId, surveyId, surveyId]);

    console.log('Testing write data...');
    await this.testWrite(TABLES.SURVEY_RESPONSE, 1000, [surveyId]);

    const surveyResponseResults = await this.db.query(
      `
        SELECT * FROM survey_response
        WHERE survey_id = $1
        ORDER BY data_time
        LIMIT 1000;
      `,
      [surveyId],
    );

    await this.testWrite(TABLES.DATA_ELEMENT, 1000);

    const dataElementResults = await this.db.query(
      `
        SELECT * FROM data_element 
        LIMIT 1;
      `,
    );
    const dataElementId = dataElementResults.rows[0].id;

    await this.testWrite(TABLES.QUESTION, 1000, [dataElementId]);

    const questionResults = await this.db.query(
      `
        SELECT * FROM question 
        LIMIT 1000;
      `,
    );

    let surveyResponsesIndex = 0;
    let questionsIndex = 0;
    const answerParametersGenerator = i => {
      if (i % 10 === 0) {
        surveyResponsesIndex++;
        questionsIndex = 0;
      }

      questionsIndex++;
      return [surveyResponseResults.rows[surveyResponsesIndex].id, questionResults.rows[questionsIndex].id];
    };

    await this.testWrite(TABLES.ANSWER, 1000, [], answerParametersGenerator);

    console.log('Testing read data...');
    await this.testRead(TABLES.SURVEY_RESPONSE, 1000);
    await this.testRead(TABLES.DATA_ELEMENT, 1000);
    await this.testRead(TABLES.QUESTION, 1000);
    await this.testRead(TABLES.ANSWER, 1000);

    console.log('Test concurrent ops...');

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
